import type {
    QueuedRequest,
    TokenRefreshConfig,
    RefreshTokenResponse,
    AuthContext,
} from '../types/token.types';

import { DEFAULT_TOKEN_REFRESH_CONFIG } from '../types/token.types';

/**
 * TokenRefreshManager - Singleton class for coordinating token refresh
 *
 * This manager handles:
 * - Detecting when a token refresh is needed
 * - Coordinating a single refresh request even with concurrent 401 errors
 * - Queuing requests that arrive during refresh
 * - Resolving/rejecting queued requests after refresh completes
 */
class TokenRefreshManager {
    private static instance: TokenRefreshManager;

    /** Flag indicating if a refresh is currently in progress */
    private isRefreshing: boolean = false;

    /** Queue of requests waiting for token refresh */
    private requestQueue: QueuedRequest[] = [];

    /** Configuration for token refresh behavior */
    private config: TokenRefreshConfig;

    /** Reference to the refresh function (set by api-client) */
    private refreshFunction: ((context: AuthContext) => Promise<RefreshTokenResponse>) | null = null;

    private constructor(config: TokenRefreshConfig = DEFAULT_TOKEN_REFRESH_CONFIG) {
        this.config = config;
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): TokenRefreshManager {
        if (!TokenRefreshManager.instance) {
            TokenRefreshManager.instance = new TokenRefreshManager();
        }

        return TokenRefreshManager.instance;
    }

    /**
     * Set the refresh function that will be called to refresh the token
     * This should be called once during api-client initialization
     */
    public setRefreshFunction(fn: (context: AuthContext) => Promise<RefreshTokenResponse>): void {
        this.refreshFunction = fn;
    }

    /**
     * Check if an endpoint should be excluded from token refresh logic
     */
    public isExcludedEndpoint(url: string): boolean {
        return this.config.excludedEndpoints.some(endpoint =>
            url.includes(endpoint)
        );
    }

    /**
     * Check if token refresh is currently in progress
     */
    public isRefreshInProgress(): boolean {
        return this.isRefreshing;
    }

    /**
     * Add a request to the queue waiting for token refresh
     * Returns a promise that resolves with the new token when refresh completes
     */
    public addToQueue(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.requestQueue.push({ resolve, reject });
            console.log('📋 [TokenRefreshManager] Request added to queue. Queue size:', this.requestQueue.length);
        });
    }

    /**
     * Process all queued requests after token refresh completes
     * @param token - The new token to use for retrying requests
     */
    private processQueue(token: string): void {
        console.log('✅ [TokenRefreshManager] Processing queue with new token. Queue size:', this.requestQueue.length);

        this.requestQueue.forEach(({ resolve }) => {
            resolve(token);
        });

        this.requestQueue = [];
    }

    /**
     * Reject all queued requests after token refresh fails
     * @param error - The error to pass to queued requests
     */
    private rejectQueue(error: Error): void {
        console.log('❌ [TokenRefreshManager] Rejecting queue. Queue size:', this.requestQueue.length);

        this.requestQueue.forEach(({ reject }) => {
            reject(error);
        });

        this.requestQueue = [];
    }

    /**
     * Attempt to refresh the token
     * Only one refresh request will be made even if multiple 401s occur
     *
     * @param context - The auth context (admin or superadmin)
     * @returns Promise that resolves with the new token or rejects on failure
     */
    public async refreshToken(context: AuthContext): Promise<string> {
        if (!this.refreshFunction) {
            throw new Error('Refresh function not set. Call setRefreshFunction first.');
        }

        // If refresh is already in progress, add to queue
        if (this.isRefreshing) {
            console.log('⏳ [TokenRefreshManager] Refresh already in progress, adding to queue');

            return this.addToQueue();
        }

        // Start refresh
        this.isRefreshing = true;
        console.log('🔄 [TokenRefreshManager] Starting token refresh for context:', context);

        try {
            const response = await this.refreshFunction(context);

            if (response.success && response.data.token) {
                const newToken = response.data.token;

                console.log('✅ [TokenRefreshManager] Token refreshed successfully');

                // Process queued requests with new token
                this.processQueue(newToken);

                return newToken;
            } else {
                throw new Error(response.message || 'Token refresh failed');
            }
        } catch (error) {
            console.error('❌ [TokenRefreshManager] Token refresh failed:', error);

            // Reject all queued requests
            const err = error instanceof Error ? error : new Error('Token refresh failed');

            this.rejectQueue(err);

            throw err;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Reset the manager state (useful for testing or logout)
     */
    public reset(): void {
        this.isRefreshing = false;
        this.requestQueue = [];
        console.log('🔄 [TokenRefreshManager] Manager state reset');
    }

    /**
     * Get the current queue size (useful for debugging)
     */
    public getQueueSize(): number {
        return this.requestQueue.length;
    }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();
