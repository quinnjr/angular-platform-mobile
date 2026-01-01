import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BridgeService } from '../core/bridge/bridge.service';
import { LinkingURL } from '../types/native.types';

/**
 * Linking Service
 *
 * Provides deep linking and URL handling capabilities.
 * Allows opening URLs, handling incoming deep links, and
 * interacting with other apps.
 */
@Injectable()
export class LinkingService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly initialUrl$ = new BehaviorSubject<string | null>(null);
  private readonly url$ = new Subject<string>();

  constructor(private readonly bridgeService: BridgeService) {
    this.initialize();
  }

  /**
   * Get the URL that opened the app (if any)
   */
  get initialUrl(): string | null {
    return this.initialUrl$.value;
  }

  /**
   * Observable for incoming URLs
   */
  get urlEvents(): Observable<string> {
    return this.url$.asObservable();
  }

  /**
   * Initialize the linking service
   */
  private async initialize(): Promise<void> {
    // Get initial URL
    try {
      const url = await this.bridgeService.request<string | null>('getInitialURL', {});
      this.initialUrl$.next(url);
    } catch (error) {
      console.warn('[LinkingService] Failed to get initial URL');
    }

    // Listen for incoming URLs
    this.bridgeService
      .on<{ url: string }>('url')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.url$.next(event.url);
      });
  }

  /**
   * Open a URL
   *
   * @example
   * ```typescript
   * // Open a web URL
   * await linkingService.openURL('https://example.com');
   *
   * // Open phone dialer
   * await linkingService.openURL('tel:+1234567890');
   *
   * // Open email
   * await linkingService.openURL('mailto:test@example.com');
   *
   * // Open maps
   * await linkingService.openURL('geo:0,0?q=New+York');
   * ```
   */
  async openURL(url: string): Promise<void> {
    const canOpen = await this.canOpenURL(url);

    if (!canOpen) {
      throw new Error(`Cannot open URL: ${url}`);
    }

    await this.bridgeService.send('openURL', { url });
  }

  /**
   * Check if a URL can be opened
   */
  async canOpenURL(url: string): Promise<boolean> {
    try {
      return await this.bridgeService.request<boolean>('canOpenURL', { url });
    } catch {
      return false;
    }
  }

  /**
   * Get the initial URL that opened the app
   */
  async getInitialURL(): Promise<string | null> {
    try {
      return await this.bridgeService.request<string | null>('getInitialURL', {});
    } catch {
      return null;
    }
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    await this.bridgeService.send('openSettings', {});
  }

  /**
   * Open a specific Android activity
   */
  async openActivity(options: {
    action: string;
    data?: string;
    type?: string;
    extras?: Record<string, any>;
    packageName?: string;
    className?: string;
  }): Promise<void> {
    await this.bridgeService.send('openActivity', options);
  }

  /**
   * Send an intent to another app
   */
  async sendIntent(options: {
    action: string;
    data?: string;
    type?: string;
    extras?: Record<string, any>;
    flags?: number[];
  }): Promise<any> {
    return this.bridgeService.request('sendIntent', options);
  }

  /**
   * Open the phone dialer with a number
   */
  async dial(phoneNumber: string): Promise<void> {
    await this.openURL(`tel:${phoneNumber}`);
  }

  /**
   * Compose an email
   */
  async email(options: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
  }): Promise<void> {
    const params = new URLSearchParams();

    if (options.subject) params.set('subject', options.subject);
    if (options.body) params.set('body', options.body);
    if (options.cc?.length) params.set('cc', options.cc.join(','));
    if (options.bcc?.length) params.set('bcc', options.bcc.join(','));

    const to = options.to?.join(',') || '';
    const query = params.toString();
    const url = `mailto:${to}${query ? '?' + query : ''}`;

    await this.openURL(url);
  }

  /**
   * Compose an SMS
   */
  async sms(phoneNumber: string, message?: string): Promise<void> {
    let url = `sms:${phoneNumber}`;
    if (message) {
      url += `?body=${encodeURIComponent(message)}`;
    }
    await this.openURL(url);
  }

  /**
   * Open maps with a location or query
   */
  async openMaps(options: {
    latitude?: number;
    longitude?: number;
    query?: string;
    label?: string;
    zoom?: number;
  }): Promise<void> {
    let url: string;

    if (options.query) {
      url = `geo:0,0?q=${encodeURIComponent(options.query)}`;
    } else if (options.latitude !== undefined && options.longitude !== undefined) {
      url = `geo:${options.latitude},${options.longitude}`;
      if (options.zoom) {
        url += `?z=${options.zoom}`;
      }
      if (options.label) {
        url += `${options.zoom ? '&' : '?'}q=${options.latitude},${options.longitude}(${encodeURIComponent(options.label)})`;
      }
    } else {
      throw new Error('Must provide either query or latitude/longitude');
    }

    await this.openURL(url);
  }

  /**
   * Open the Play Store to a specific app
   */
  async openPlayStore(packageName?: string): Promise<void> {
    const pkg = packageName || (await this.bridgeService.request<string>('getPackageName', {}));
    await this.openURL(`market://details?id=${pkg}`);
  }

  /**
   * Parse a URL into components
   */
  parseURL(url: string): LinkingURL {
    try {
      const parsed = new URL(url);
      const queryParams: Record<string, string> = {};

      parsed.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      return {
        url,
        host: parsed.host,
        hostname: parsed.hostname,
        path: parsed.pathname,
        pathname: parsed.pathname,
        protocol: parsed.protocol.replace(':', ''),
        query: parsed.search,
        queryParams,
      };
    } catch {
      return { url };
    }
  }

  /**
   * Add a listener for URL events
   */
  addEventListener(callback: (event: { url: string }) => void): () => void {
    const subscription = this.url$.pipe(takeUntil(this.destroy$)).subscribe((url) => {
      callback({ url });
    });

    return () => subscription.unsubscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
