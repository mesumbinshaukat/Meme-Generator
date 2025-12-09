import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/admin/analytics';

export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        const adminSession = request.cookies.get('admin-session');
        if (!adminSession) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get analytics data
        const analytics = await getAnalyticsSummary();

        return NextResponse.json({
            success: true,
            data: analytics,
        });
    } catch (error: any) {
        console.error('[Admin Analytics] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
