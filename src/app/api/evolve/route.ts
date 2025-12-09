import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { EvolveMemeSchema } from '@/lib/utils/validation';
import { checkRateLimit, hashIP } from '@/lib/utils/rate-limiter';
import { evolutionEngine } from '@/lib/ai/evolution-engine';
import { getTemplateById } from '@/lib/meme/templates';
import { generateMeme } from '@/lib/meme/generator';
import { exec, query } from '@/lib/db';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Get client IP
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const ipHash = hashIP(ip);

        // Rate limiting
        const rateLimit = await checkRateLimit(ipHash, 5, 60000);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
                { status: 429 }
            );
        }

        // Parse and validate request
        const body = await request.json();
        const validatedData = EvolveMemeSchema.parse(body);

        // Get original meme
        const originalMeme = await query<{
            id: string;
            caption: string;
            template_id: string;
            session_id: string;
        }>('SELECT * FROM memes WHERE id = ?', [validatedData.memeId]);

        if (originalMeme.length === 0) {
            return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
        }

        const original = originalMeme[0];
        const template = getTemplateById(original.template_id);

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Generate mutations
        const mutations = await evolutionEngine.evolveMeme(
            original.caption,
            validatedData.feedback,
            validatedData.mutationType
        );

        // Create meme images for each mutation
        const evolvedMemes = [];

        for (const mutatedCaption of mutations) {
            const memeId = nanoid();

            // Prepare text zones
            const texts: Record<string, string> = {};
            if (template.textZones.length === 1) {
                texts[template.textZones[0].id] = mutatedCaption;
            } else if (template.textZones.length === 2) {
                const parts = mutatedCaption.split('\n');
                texts[template.textZones[0].id] = parts[0] || mutatedCaption;
                texts[template.textZones[1].id] = parts[1] || '';
            } else {
                const parts = mutatedCaption.split('\n').filter(p => p.trim());
                template.textZones.forEach((zone, i) => {
                    texts[zone.id] = parts[i] || '';
                });
            }

            // Generate meme image
            const outputPath = `public/generated/${memeId}.jpg`;
            await generateMeme({ template, texts, outputPath });

            const imageUrl = `/generated/${memeId}.jpg`;
            const now = Date.now();

            // Save to database
            await exec(
                `INSERT INTO memes (id, session_id, parent_id, template_id, caption, image_url, created_at, generation_time_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    memeId,
                    original.session_id,
                    original.id,
                    template.id,
                    mutatedCaption,
                    imageUrl,
                    now,
                    Date.now() - startTime,
                ]
            );

            // Record evolution
            await exec(
                `INSERT INTO evolutions (parent_meme_id, child_meme_id, mutation_type, feedback, created_at)
         VALUES (?, ?, ?, ?, ?)`,
                [
                    original.id,
                    memeId,
                    validatedData.mutationType || 'variation',
                    validatedData.feedback || null,
                    now,
                ]
            );

            evolvedMemes.push({
                id: memeId,
                imageUrl,
                caption: mutatedCaption,
                mutationType: validatedData.mutationType || 'variation',
            });
        }

        // Log analytics
        await exec(
            `INSERT INTO analytics (event_type, meme_id, session_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?)`,
            [
                'evolve',
                original.id,
                original.session_id,
                JSON.stringify({ mutationType: validatedData.mutationType, count: mutations.length }),
                Date.now(),
            ]
        );

        return NextResponse.json({
            success: true,
            mutations: evolvedMemes,
            generationTime: Date.now() - startTime,
        });
    } catch (error: any) {
        console.error('Error evolving meme:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to evolve meme', message: error.message },
            { status: 500 }
        );
    }
}
