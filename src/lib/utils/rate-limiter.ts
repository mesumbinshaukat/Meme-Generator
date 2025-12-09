import { RateLimiterMemory } from 'rate-limiter-flexible';
import crypto from 'crypto';

const rateLimiters = new Map<string, RateLimiterMemory>();

/**
 * Get or create rate limiter for a specific key
 */
function getRateLimiter(key: string, maxRequests: number, windowMs: number): RateLimiterMemory {
    if (!rateLimiters.has(key)) {
        rateLimiters.set(
            key,
            new RateLimiterMemory({
                points: maxRequests,
                duration: Math.floor(windowMs / 1000),
            })
        );
    }
    return rateLimiters.get(key)!;
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * Check if request is rate limited
 */
export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const limiter = getRateLimiter('api', maxRequests, windowMs);

    try {
        const result = await limiter.consume(identifier);

        return {
            allowed: true,
            remaining: result.remainingPoints,
            resetAt: new Date(Date.now() + result.msBeforeNext),
        };
    } catch (error: any) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(Date.now() + error.msBeforeNext),
        };
    }
}

/**
 * Reset rate limit for identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
    const limiter = getRateLimiter('api', 5, 60000);
    await limiter.delete(identifier);
}

/**
 * Get rate limit info without consuming
 */
export async function getRateLimitInfo(
    identifier: string
): Promise<{ remaining: number; resetAt: Date | null }> {
    const limiter = getRateLimiter('api', 5, 60000);

    try {
        const result = await limiter.get(identifier);

        if (!result) {
            return { remaining: 5, resetAt: null };
        }

        return {
            remaining: result.remainingPoints,
            resetAt: new Date(Date.now() + result.msBeforeNext),
        };
    } catch (error) {
        return { remaining: 0, resetAt: null };
    }
}
