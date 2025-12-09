import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if accessing admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Check for admin session cookie
        const adminSession = request.cookies.get('admin-session');

        // If no session and not on login page, redirect to login
        if (!adminSession && !request.nextUrl.pathname.includes('/admin/login')) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
