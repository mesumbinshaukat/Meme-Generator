import { getDatabase } from '../db';

export interface AnalyticsSummary {
    totalMemes: number;
    totalSessions: number;
    totalEvolutions: number;
    totalEvents: number;
    successRate: number;
    avgGenerationTime: number;
    popularTemplates: Array<{ id: string; name: string; count: number }>;
    recentMemes: Array<{
        id: string;
        caption: string;
        template: string;
        created_at: string;
    }>;
    errorLogs: Array<{
        timestamp: string;
        error: string;
        context: string;
    }>;
    dailyStats: Array<{
        date: string;
        memes: number;
        evolutions: number;
    }>;
}

/**
 * Get comprehensive analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const db = await getDatabase();

    // Total memes
    const totalMemes = db.memes.length;

    // Total sessions
    const totalSessions = db.sessions.length;

    // Total evolutions
    const totalEvolutions = db.evolutions.length;

    // Total events
    const totalEvents = db.analytics.length;

    // Success rate (memes with captions vs total attempts)
    const successfulMemes = db.memes.filter((m) => m.caption && m.caption.length > 0).length;
    const successRate = totalMemes > 0 ? (successfulMemes / totalMemes) * 100 : 0;

    // Average generation time
    const generationEvents = db.analytics.filter((a) => a.event_type === 'meme_generated');
    const avgGenerationTime =
        generationEvents.length > 0
            ? generationEvents.reduce((sum, e) => sum + (e.metadata?.generation_time || 0), 0) /
            generationEvents.length
            : 0;

    // Popular templates
    const templateCounts: Record<string, { name: string; count: number }> = {};
    db.memes.forEach((meme) => {
        const templateId = meme.template_id;
        if (!templateCounts[templateId]) {
            templateCounts[templateId] = { name: meme.template_id, count: 0 };
        }
        templateCounts[templateId].count++;
    });

    const popularTemplates = Object.entries(templateCounts)
        .map(([id, data]) => ({ id, name: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    // Recent memes (last 10)
    const recentMemes = db.memes
        .slice(-10)
        .reverse()
        .map((meme) => ({
            id: meme.id,
            caption: meme.caption,
            template: meme.template_id,
            created_at: meme.created_at,
        }));

    // Error logs (from analytics events)
    const errorLogs = db.analytics
        .filter((a) => a.event_type === 'error' || a.event_type === 'api_error')
        .slice(-20)
        .reverse()
        .map((event) => ({
            timestamp: event.created_at,
            error: event.metadata?.error || 'Unknown error',
            context: event.metadata?.context || '',
        }));

    // Daily stats (last 7 days)
    const dailyStats = calculateDailyStats(db.memes, db.evolutions);

    return {
        totalMemes,
        totalSessions,
        totalEvolutions,
        totalEvents,
        successRate,
        avgGenerationTime,
        popularTemplates,
        recentMemes,
        errorLogs,
        dailyStats,
    };
}

/**
 * Calculate daily statistics
 */
function calculateDailyStats(
    memes: any[],
    evolutions: any[]
): Array<{ date: string; memes: number; evolutions: number }> {
    const stats: Record<string, { memes: number; evolutions: number }> = {};

    // Last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        stats[dateStr] = { memes: 0, evolutions: 0 };
    }

    // Count memes per day
    memes.forEach((meme) => {
        const dateStr = meme.created_at.split('T')[0];
        if (stats[dateStr]) {
            stats[dateStr].memes++;
        }
    });

    // Count evolutions per day
    evolutions.forEach((evolution) => {
        const dateStr = evolution.created_at.split('T')[0];
        if (stats[dateStr]) {
            stats[dateStr].evolutions++;
        }
    });

    return Object.entries(stats).map(([date, data]) => ({
        date,
        memes: data.memes,
        evolutions: data.evolutions,
    }));
}

/**
 * Export analytics data as CSV
 */
export function exportToCSV(data: AnalyticsSummary): string {
    const lines: string[] = [];

    // Header
    lines.push('EvoMeme AI - Analytics Export');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Summary
    lines.push('Summary Statistics');
    lines.push('Metric,Value');
    lines.push(`Total Memes,${data.totalMemes}`);
    lines.push(`Total Sessions,${data.totalSessions}`);
    lines.push(`Total Evolutions,${data.totalEvolutions}`);
    lines.push(`Total Events,${data.totalEvents}`);
    lines.push(`Success Rate,${data.successRate.toFixed(2)}%`);
    lines.push(`Avg Generation Time,${data.avgGenerationTime.toFixed(0)}ms`);
    lines.push('');

    // Popular templates
    lines.push('Popular Templates');
    lines.push('Template ID,Template Name,Count');
    data.popularTemplates.forEach((template) => {
        lines.push(`${template.id},${template.name},${template.count}`);
    });
    lines.push('');

    // Daily stats
    lines.push('Daily Statistics');
    lines.push('Date,Memes,Evolutions');
    data.dailyStats.forEach((stat) => {
        lines.push(`${stat.date},${stat.memes},${stat.evolutions}`);
    });
    lines.push('');

    // Recent memes
    lines.push('Recent Memes');
    lines.push('ID,Caption,Template,Created At');
    data.recentMemes.forEach((meme) => {
        const caption = meme.caption.replace(/,/g, ';').replace(/\n/g, ' ');
        lines.push(`${meme.id},${caption},${meme.template},${meme.created_at}`);
    });

    return lines.join('\n');
}
