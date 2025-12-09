import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Clear session cookie
        const response = NextResponse.json({ success: true });
        response.cookies.delete('admin-session');

        return response;
    } catch (error: any) {
        console.error('[Admin Logout] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
