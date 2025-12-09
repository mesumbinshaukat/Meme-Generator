import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'evomeme-secret-key-change-in-production';

/**
 * Verify admin password
 */
export function verifyPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}

/**
 * Create admin session token
 */
export function createSessionToken(): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const data = `${timestamp}-${randomBytes}`;

    const hash = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(data)
        .digest('hex');

    return `${timestamp}.${hash}`;
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): boolean {
    try {
        const [timestamp, hash] = token.split('.');

        // Check if token is expired (24 hours)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ip: string): string {
    return crypto
        .createHash('sha256')
        .update(ip + SESSION_SECRET)
        .digest('hex')
        .substring(0, 16);
}
