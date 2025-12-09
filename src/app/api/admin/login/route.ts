import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                { success: false, error: 'Password required' },
                { status: 400 }
            );
        }

        // Verify password
        if (!verifyPassword(password)) {
            return NextResponse.json(
                { success: false, error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Create session token
        const token = createSessionToken();

        // Set cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('admin-session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('[Admin Login] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Login failed' },
            { status: 500 }
        );
    }
}
