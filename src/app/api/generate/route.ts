import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { GenerateMemeSchema } from '@/lib/utils/validation';
import { checkRateLimit, hashIP } from '@/lib/utils/rate-limiter';
import { generateCaption } from '@/lib/ai/caption-generator';
import { getTemplateById, getRandomTemplate } from '@/lib/meme/templates';
import { generateMeme } from '@/lib/meme/generator';
import { exec, query } from '@/lib/db';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Get client IP
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const ipHash = hashIP(ip);

        // Rate limiting
        const rateLimit = await checkRateLimit(
            ipHash,
            parseInt(process.env.RATE_LIMIT_MAX || '5'),
            parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
        );

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    resetAt: rateLimit.resetAt,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
                    },
                }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = GenerateMemeSchema.parse(body);

        // Get or create session
        const sessionId = request.cookies.get('session_id')?.value || nanoid();

        // Select template
        const template = validatedData.templateId
            ? getTemplateById(validatedData.templateId)
            : getRandomTemplate();

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Generate caption using AI
        console.log('[API] About to generate caption...');
        console.log('[API] Prompt:', validatedData.prompt);
        console.log('[API] Tone:', validatedData.tone);
        console.log('[API] Language:', validatedData.language);

        const caption = await generateCaption({
            prompt: validatedData.prompt,
            language: validatedData.language,
            tone: validatedData.tone,
        });

        console.log('[API] Caption generated:', caption);
        console.log('[API] Caption length:', caption.length);

        // Check if user wants text-only mode (no image generation)
        if (!validatedData.generateImageMode) {
            console.log('[API] Text-only mode - generating meme ideas...');

            const { generateMemeIdea } = await import('@/lib/ai/meme-idea-generator');
            const memeIdea = await generateMemeIdea({
                prompt: validatedData.prompt,
                caption,
                tone: validatedData.tone,
            });

            // Save to database (without image)
            const memeId = nanoid();
            const now = Date.now();
            await exec(
                `INSERT INTO memes (id, session_id, template_id, caption, image_url, language, tone, created_at, generation_time_ms)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    memeId,
                    sessionId,
                    'text-only',
                    caption,
                    '',
                    validatedData.language,
                    validatedData.tone,
                    now,
                    Date.now() - startTime,
                ]
            );

            // Log analytics
            await exec(
                `INSERT INTO analytics (event_type, meme_id, session_id, metadata, created_at)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    'generate',
                    memeId,
                    sessionId,
                    JSON.stringify({ prompt: validatedData.prompt, mode: 'text-only' }),
                    now,
                ]
            );

            // Return text-only response
            const response = NextResponse.json({
                success: true,
                textOnly: true,
                meme: {
                    id: memeId,
                    caption,
                    memeIdea,
                },
                generationTime: Date.now() - startTime,
            });

            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60,
                sameSite: 'lax',
            });

            return response;
        }

        // Prepare text for meme zones
        const texts: Record<string, string> = {};

        if (template.textZones.length === 1) {
            texts[template.textZones[0].id] = caption;
        } else if (template.textZones.length === 2) {
            // Split caption for two-zone templates
            const parts = caption.split('\n');
            texts[template.textZones[0].id] = parts[0] || caption;
            texts[template.textZones[1].id] = parts[1] || '';
        } else {
            // For multi-zone templates, distribute text
            const parts = caption.split('\n').filter(p => p.trim());
            template.textZones.forEach((zone, i) => {
                texts[zone.id] = parts[i] || '';
            });
        }

        // Generate meme image
        const memeId = nanoid();
        const outputPath = `public/generated/${memeId}.jpg`;
        await generateMeme({ template, texts, outputPath });

        const imageUrl = `/generated/${memeId}.jpg`;

        // Save to database
        const now = Date.now();
        await exec(
            `INSERT INTO memes (id, session_id, template_id, caption, image_url, language, tone, created_at, generation_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                memeId,
                sessionId,
                template.id,
                caption,
                imageUrl,
                validatedData.language,
                validatedData.tone,
                now,
                Date.now() - startTime,
            ]
        );

        // Log analytics
        await exec(
            `INSERT INTO analytics (event_type, meme_id, session_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?)`,
            [
                'generate',
                memeId,
                sessionId,
                JSON.stringify({ prompt: validatedData.prompt, template: template.id }),
                now,
            ]
        );

        // Return response
        const response = NextResponse.json({
            success: true,
            meme: {
                id: memeId,
                imageUrl,
                caption,
                templateId: template.id,
                templateName: template.name,
            },
            generationTime: Date.now() - startTime,
        });

        // Set session cookie
        response.cookies.set('session_id', sessionId, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: 'lax',
        });

        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

        return response;
    } catch (error: any) {
        console.error('Error generating meme:', error);

        // Log error
        try {
            await exec(
                `INSERT INTO analytics (event_type, metadata, created_at)
         VALUES (?, ?, ?)`,
                ['error', JSON.stringify({ error: error.message, endpoint: '/api/generate' }), Date.now()]
            );
        } catch (dbError) {
            console.error('Failed to log error:', dbError);
        }

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate meme', message: error.message },
            { status: 500 }
        );
    }
}
