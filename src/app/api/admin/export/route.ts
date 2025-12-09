import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, exportToCSV } from '@/lib/admin/analytics';

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

        // Export to CSV
        const csv = exportToCSV(analytics);

        // Return CSV file
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="evomeme-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        console.error('[Admin Export] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Export failed' },
            { status: 500 }
        );
    }
}
