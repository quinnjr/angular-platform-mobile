import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BridgeService } from '../core/bridge/bridge.service';

/**
 * Clipboard content type
 */
export interface ClipboardContent {
  [key: string]: string | undefined;
  text?: string;
  html?: string;
  uri?: string;
}

/**
 * Clipboard Service
 *
 * Provides access to the system clipboard for copying and pasting content.
 * Maps to Android's ClipboardManager.
 */
@Injectable()
export class ClipboardService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly clipboardChange$ = new Subject<ClipboardContent>();

  constructor(private readonly bridgeService: BridgeService) {
    this.initialize();
  }

  /**
   * Observable for clipboard changes
   */
  get changes(): Observable<ClipboardContent> {
    return this.clipboardChange$.asObservable();
  }

  /**
   * Initialize clipboard listener
   */
  private initialize(): void {
    this.bridgeService
      .on<ClipboardContent>('clipboardChange')
      .pipe(takeUntil(this.destroy$))
      .subscribe((content) => {
        this.clipboardChange$.next(content);
      });
  }

  /**
   * Get the current clipboard string content
   *
   * @example
   * ```typescript
   * const text = await clipboardService.getString();
   * console.log('Clipboard:', text);
   * ```
   */
  async getString(): Promise<string> {
    try {
      const result = await this.bridgeService.request<{ text: string }>('getClipboardString', {});
      return result.text || '';
    } catch (error) {
      console.warn('[ClipboardService] Failed to get clipboard string:', error);
      return '';
    }
  }

  /**
   * Set the clipboard string content
   *
   * @example
   * ```typescript
   * await clipboardService.setString('Hello, World!');
   * ```
   */
  async setString(text: string): Promise<void> {
    await this.bridgeService.send('setClipboardString', { text });
  }

  /**
   * Get clipboard content (may include HTML or URI)
   */
  async getContent(): Promise<ClipboardContent> {
    try {
      return await this.bridgeService.request<ClipboardContent>('getClipboardContent', {});
    } catch (error) {
      console.warn('[ClipboardService] Failed to get clipboard content:', error);
      return {};
    }
  }

  /**
   * Set clipboard content with multiple types
   */
  async setContent(content: ClipboardContent): Promise<void> {
    await this.bridgeService.send('setClipboardContent', content);
  }

  /**
   * Set HTML content to clipboard
   */
  async setHtml(html: string, plainText?: string): Promise<void> {
    await this.setContent({
      html,
      text: plainText || this.stripHtml(html),
    });
  }

  /**
   * Get HTML content from clipboard
   */
  async getHtml(): Promise<string | null> {
    const content = await this.getContent();
    return content.html || null;
  }

  /**
   * Check if clipboard has content
   */
  async hasContent(): Promise<boolean> {
    try {
      const result = await this.bridgeService.request<{ hasContent: boolean }>(
        'hasClipboardContent',
        {}
      );
      return result.hasContent;
    } catch {
      return false;
    }
  }

  /**
   * Check if clipboard has string content
   */
  async hasString(): Promise<boolean> {
    try {
      const result = await this.bridgeService.request<{ hasString: boolean }>(
        'hasClipboardString',
        {}
      );
      return result.hasString;
    } catch {
      return false;
    }
  }

  /**
   * Check if clipboard has URL content
   */
  async hasURL(): Promise<boolean> {
    try {
      const result = await this.bridgeService.request<{ hasURL: boolean }>('hasClipboardURL', {});
      return result.hasURL;
    } catch {
      return false;
    }
  }

  /**
   * Get URL from clipboard
   */
  async getURL(): Promise<string | null> {
    try {
      const result = await this.bridgeService.request<{ url: string | null }>(
        'getClipboardURL',
        {}
      );
      return result.url;
    } catch {
      return null;
    }
  }

  /**
   * Set a URL to clipboard
   */
  async setURL(url: string): Promise<void> {
    await this.setContent({ uri: url, text: url });
  }

  /**
   * Clear the clipboard
   */
  async clear(): Promise<void> {
    await this.bridgeService.send('clearClipboard', {});
  }

  /**
   * Copy text to clipboard (alias for setString)
   */
  async copy(text: string): Promise<void> {
    return this.setString(text);
  }

  /**
   * Paste from clipboard (alias for getString)
   */
  async paste(): Promise<string> {
    return this.getString();
  }

  /**
   * Add a listener for clipboard changes
   */
  addListener(callback: (content: ClipboardContent) => void): () => void {
    const subscription = this.clipboardChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(callback);

    return () => subscription.unsubscribe();
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
