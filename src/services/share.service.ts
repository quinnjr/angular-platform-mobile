import { Injectable } from '@angular/core';
import { BridgeService } from '../core/bridge/bridge.service';
import { ShareContent, ShareOptions } from '../types/native.types';

/**
 * Share result
 */
export interface ShareResult {
  action: 'sharedAction' | 'dismissedAction';
  activityType?: string;
}

/**
 * Share image content
 */
export interface ShareImageContent {
  type: 'image';
  uri: string;
  title?: string;
  message?: string;
}

/**
 * Share file content
 */
export interface ShareFileContent {
  type: 'file';
  uri: string;
  mimeType?: string;
  title?: string;
  message?: string;
}

/**
 * Share Service
 *
 * Provides native sharing capabilities using Android's share intent.
 * Allows sharing text, URLs, images, and files with other apps.
 */
@Injectable()
export class ShareService {
  constructor(private readonly bridgeService: BridgeService) {}

  /**
   * Open the share dialog
   *
   * @example
   * ```typescript
   * // Share text
   * await shareService.share({ message: 'Check this out!' });
   *
   * // Share URL with title
   * await shareService.share({
   *   title: 'Awesome Link',
   *   url: 'https://example.com'
   * });
   *
   * // Share with custom dialog title
   * await shareService.share(
   *   { message: 'Hello!' },
   *   { dialogTitle: 'Share via' }
   * );
   * ```
   */
  async share(content: ShareContent, options?: ShareOptions): Promise<ShareResult> {
    if (!content.message && !content.url && !content.title) {
      throw new Error('Share content must include at least one of: message, url, or title');
    }

    try {
      return await this.bridgeService.request<ShareResult>('share', {
        content: {
          title: content.title,
          message: content.message,
          url: content.url,
        },
        options: {
          dialogTitle: options?.dialogTitle,
          excludedActivityTypes: options?.excludedActivityTypes,
          subject: options?.subject,
        },
      });
    } catch (error) {
      console.warn('[ShareService] Share failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Share an image
   *
   * @example
   * ```typescript
   * await shareService.shareImage({
   *   type: 'image',
   *   uri: 'file:///path/to/image.jpg',
   *   title: 'Check out this photo!',
   *   message: 'Amazing sunset'
   * });
   * ```
   */
  async shareImage(content: ShareImageContent, options?: ShareOptions): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareImage', {
        content: {
          uri: content.uri,
          title: content.title,
          message: content.message,
        },
        options: {
          dialogTitle: options?.dialogTitle,
          excludedActivityTypes: options?.excludedActivityTypes,
        },
      });
    } catch (error) {
      console.warn('[ShareService] Share image failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Share a file
   *
   * @example
   * ```typescript
   * await shareService.shareFile({
   *   type: 'file',
   *   uri: 'file:///path/to/document.pdf',
   *   mimeType: 'application/pdf',
   *   title: 'Document'
   * });
   * ```
   */
  async shareFile(content: ShareFileContent, options?: ShareOptions): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareFile', {
        content: {
          uri: content.uri,
          mimeType: content.mimeType || '*/*',
          title: content.title,
          message: content.message,
        },
        options: {
          dialogTitle: options?.dialogTitle,
          excludedActivityTypes: options?.excludedActivityTypes,
        },
      });
    } catch (error) {
      console.warn('[ShareService] Share file failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Share multiple files
   */
  async shareMultiple(
    content: {
      uris: string[];
      mimeType?: string;
      title?: string;
      message?: string;
    },
    options?: ShareOptions
  ): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareMultiple', {
        content: {
          uris: content.uris,
          mimeType: content.mimeType || '*/*',
          title: content.title,
          message: content.message,
        },
        options: {
          dialogTitle: options?.dialogTitle,
          excludedActivityTypes: options?.excludedActivityTypes,
        },
      });
    } catch (error) {
      console.warn('[ShareService] Share multiple failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Check if sharing is available
   */
  async isShareAvailable(): Promise<boolean> {
    try {
      return await this.bridgeService.request<boolean>('isShareAvailable', {});
    } catch {
      return true; // Assume available on Android
    }
  }

  /**
   * Share text message
   */
  async shareText(text: string, title?: string): Promise<ShareResult> {
    return this.share({ message: text, title });
  }

  /**
   * Share a URL
   */
  async shareUrl(url: string, title?: string): Promise<ShareResult> {
    return this.share({ url, title });
  }

  /**
   * Share via a specific app (by package name)
   */
  async shareToApp(
    packageName: string,
    content: ShareContent
  ): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareToApp', {
        packageName,
        content: {
          title: content.title,
          message: content.message,
          url: content.url,
        },
      });
    } catch (error) {
      console.warn('[ShareService] Share to app failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Share via email
   */
  async shareViaEmail(options: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
    attachments?: string[];
  }): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareViaEmail', options);
    } catch (error) {
      console.warn('[ShareService] Share via email failed:', error);
      return { action: 'dismissedAction' };
    }
  }

  /**
   * Share via SMS/text message
   */
  async shareViaSms(options: {
    phoneNumber?: string;
    message: string;
  }): Promise<ShareResult> {
    try {
      return await this.bridgeService.request<ShareResult>('shareViaSms', options);
    } catch (error) {
      console.warn('[ShareService] Share via SMS failed:', error);
      return { action: 'dismissedAction' };
    }
  }
}
