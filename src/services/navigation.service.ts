import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BridgeService } from '../core/bridge/bridge.service';

/**
 * Navigation state
 */
export interface NavigationState {
  routeName: string;
  params?: Record<string, unknown>;
  key: string;
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  params?: Record<string, unknown>;
  merge?: boolean;
}

/**
 * Navigation listener
 */
export type NavigationListener = (state: NavigationState) => void;

/**
 * Navigation Service
 *
 * Provides navigation capabilities for Android apps.
 * Handles screen transitions and back stack management.
 */
@Injectable()
export class NavigationService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly navigationState$ = new BehaviorSubject<NavigationState | null>(null);
  private readonly history: NavigationState[] = [];
  private keyCounter = 0;

  constructor(private readonly bridgeService: BridgeService) {
    this.setupBackHandler();
  }

  /**
   * Get current navigation state
   */
  get currentState$(): Observable<NavigationState | null> {
    return this.navigationState$.asObservable();
  }

  /**
   * Get current route name
   */
  get currentRoute(): string | null {
    return this.navigationState$.value?.routeName || null;
  }

  /**
   * Navigate to a screen
   */
  async navigate(routeName: string, options: NavigateOptions = {}): Promise<void> {
    const key = `route_${++this.keyCounter}`;
    const state: NavigationState = {
      routeName,
      params: options.params,
      key,
    };

    // Add to history
    this.history.push(state);

    // Update state
    this.navigationState$.next(state);

    // Notify native side
    await this.bridgeService.send('navigate', {
      routeName,
      params: options.params,
      key,
    });
  }

  /**
   * Push a new screen onto the stack
   */
  async push(routeName: string, options: NavigateOptions = {}): Promise<void> {
    return this.navigate(routeName, options);
  }

  /**
   * Replace the current screen
   */
  async replace(routeName: string, options: NavigateOptions = {}): Promise<void> {
    const key = `route_${++this.keyCounter}`;
    const state: NavigationState = {
      routeName,
      params: options.params,
      key,
    };

    // Replace last in history
    if (this.history.length > 0) {
      this.history[this.history.length - 1] = state;
    } else {
      this.history.push(state);
    }

    this.navigationState$.next(state);

    await this.bridgeService.send('replace', {
      routeName,
      params: options.params,
      key,
    });
  }

  /**
   * Go back to the previous screen
   */
  async goBack(): Promise<boolean> {
    if (this.history.length <= 1) {
      // Can't go back, at root
      return false;
    }

    this.history.pop();
    const previousState = this.history[this.history.length - 1];
    this.navigationState$.next(previousState);

    await this.bridgeService.send('goBack', {});
    return true;
  }

  /**
   * Pop to a specific screen in the stack
   */
  async popTo(routeName: string): Promise<boolean> {
    const index = this.history.findIndex((s) => s.routeName === routeName);

    if (index === -1) {
      return false;
    }

    // Remove all screens after the target
    this.history.splice(index + 1);
    const state = this.history[this.history.length - 1];
    this.navigationState$.next(state);

    await this.bridgeService.send('popTo', { routeName });
    return true;
  }

  /**
   * Pop to the root screen
   */
  async popToTop(): Promise<void> {
    if (this.history.length <= 1) {
      return;
    }

    const rootState = this.history[0];
    this.history.splice(1);
    this.navigationState$.next(rootState);

    await this.bridgeService.send('popToTop', {});
  }

  /**
   * Reset the navigation state
   */
  async reset(routeName: string, params?: Record<string, unknown>): Promise<void> {
    const key = `route_${++this.keyCounter}`;
    const state: NavigationState = {
      routeName,
      params,
      key,
    };

    this.history.splice(0);
    this.history.push(state);
    this.navigationState$.next(state);

    await this.bridgeService.send('reset', {
      routeName,
      params,
      key,
    });
  }

  /**
   * Get route params
   */
  getParams<T extends Record<string, unknown>>(): T | undefined {
    return this.navigationState$.value?.params as T | undefined;
  }

  /**
   * Set params for current route
   */
  async setParams(params: Record<string, unknown>): Promise<void> {
    const current = this.navigationState$.value;
    if (!current) return;

    const updated: NavigationState = {
      ...current,
      params: { ...current.params, ...params },
    };

    // Update in history
    const index = this.history.findIndex((s) => s.key === current.key);
    if (index !== -1) {
      this.history[index] = updated;
    }

    this.navigationState$.next(updated);

    await this.bridgeService.send('setParams', { params });
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.history.length > 1;
  }

  /**
   * Get navigation history
   */
  getHistory(): NavigationState[] {
    return [...this.history];
  }

  /**
   * Add a navigation listener
   */
  addListener(listener: NavigationListener): () => void {
    const subscription = this.navigationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state) {
          listener(state);
        }
      });

    return () => subscription.unsubscribe();
  }

  /**
   * Setup hardware back button handler
   */
  private setupBackHandler(): void {
    this.bridgeService
      .on<void>('hardwareBackPress')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        void this.goBack();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
