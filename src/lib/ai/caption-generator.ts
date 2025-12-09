import OpenAI from 'openai';

// Load environment variables - NO HARDCODED VALUES
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'arcee-ai/trinity-mini:free';
const HUGGING_FACE_ACCESS_TOKEN = process.env.HUGGING_FACE_ACCESS_TOKEN || '';
const HUGGING_FACE_MODEL = process.env.HUGGING_FACE_MODEL || 'allenai/Olmo-3-7B-Instruct:publicai';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('[AI Init] Initializing AI services...');
console.log('[AI Init] OpenRouter API Key present:', !!OPENROUTER_API_KEY);
console.log('[AI Init] OpenRouter Model:', OPENROUTER_MODEL);
console.log('[AI Init] Hugging Face Token present:', !!HUGGING_FACE_ACCESS_TOKEN);
console.log('[AI Init] Hugging Face Model:', HUGGING_FACE_MODEL);

// Initialize OpenRouter client
const openRouterClient = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': APP_URL,
        'X-Title': 'EvoMeme AI',
    },
});

// Initialize Hugging Face client (using new router endpoint)
const huggingFaceClient = HUGGING_FACE_ACCESS_TOKEN ? new OpenAI({
    apiKey: HUGGING_FACE_ACCESS_TOKEN,
    baseURL: 'https://router.huggingface.co/v1',
}) : null;

export interface CaptionOptions {
    prompt: string;
    language?: string;
    tone?: 'funny' | 'sarcastic' | 'wholesome' | 'dark' | 'random';
    maxLength?: number;
}

export interface MutationOptions {
    originalCaption: string;
    feedback?: string;
    mutationType?: 'variation' | 'tone-shift' | 'format-change';
}

/**
 * Call Hugging Face Inference Router with retry logic for model loading
 */
async function callHuggingFace(systemPrompt: string, userPrompt: string, retryCount: number = 0): Promise<string> {
    if (!huggingFaceClient) {
        throw new Error('Hugging Face client not configured');
    }

    console.log(`[HF] Calling Hugging Face Router (attempt ${retryCount + 1})...`);

    try {
        const response = await huggingFaceClient.chat.completions.create({
            model: HUGGING_FACE_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.9,
            max_tokens: 150,
        });

        const caption = response.choices[0]?.message?.content?.trim() || '';

        if (caption && caption.length > 0) {
            return caption;
        }

        throw new Error('Empty response from Hugging Face');
    } catch (error: any) {
        console.error('[HF] Error:', error.message);

        // Check for 400 errors (invalid model for chat)
        if (error.status === 400) {
            console.error('[HF] Invalid model for chat:', HUGGING_FACE_MODEL);
            throw error;
        }

        // Check if model is loading (503 status or 'loading' in message)
        const isLoading = error.status === 503 ||
            error.message?.toLowerCase().includes('loading') ||
            error.message?.toLowerCase().includes('currently loading');

        if (isLoading && retryCount < 1) {
            console.log('[HF] Model is loading, waiting 5 seconds and retrying...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return callHuggingFace(systemPrompt, userPrompt, retryCount + 1);
        }

        throw error;
    }
}

/**
 * Generate a meme caption with automatic fallback and retry logic
 */
export async function generateCaption(options: CaptionOptions, retryCount: number = 0): Promise<string> {
    const { prompt, language = 'en', tone = 'funny', maxLength = 100 } = options;

    const systemPrompt = `You are a witty meme caption generator. Create short, punchy, and hilarious captions for memes.
Rules:
- Keep captions under ${maxLength} characters
- Use internet slang and meme culture references when appropriate
- Match the requested tone: ${tone}
- Language: ${language}
- Format: Return ONLY the caption text, no quotes or explanations`;

    const userPrompt = `Create a ${tone} meme caption about: ${prompt}`;

    // Try OpenRouter first
    if (OPENROUTER_API_KEY) {
        try {
            console.log('[AI] Trying OpenRouter...');

            const response = await openRouterClient.chat.completions.create({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.9,
                max_tokens: 150,
            });

            let caption = response.choices[0]?.message?.content?.trim() || '';

            if (caption && caption.length > 0) {
                // Enforce length limit
                if (caption.length > maxLength) {
                    caption = caption.slice(0, maxLength);
                }
                console.log('[AI] OpenRouter success:', caption.substring(0, 50) + '...');
                return caption.replace(/^["']|["']$/g, '');
            }

            console.warn('[AI] OpenRouter returned empty caption, trying fallback...');
        } catch (error: any) {
            console.error('[AI] OpenRouter error:', error.message);

            // Retry once for 429 rate limit errors with 10s wait
            if ((error.status === 429 || error.message?.includes('rate limit')) && retryCount < 1) {
                console.log('[AI] Rate limit detected, waiting 10 seconds and retrying...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                return generateCaption(options, retryCount + 1);
            }

            // For other errors or after retry, fall back to HF
            console.log('[AI] Falling back to Hugging Face...');
        }
    }

    // Fallback to Hugging Face
    if (huggingFaceClient) {
        try {
            console.log('[AI] Using Hugging Face fallback...');
            let caption = await callHuggingFace(systemPrompt, userPrompt);

            if (caption && caption.length > 0) {
                // Enforce length limit
                if (caption.length > maxLength) {
                    caption = caption.slice(0, maxLength);
                }
                console.log('[AI] Hugging Face success:', caption.substring(0, 50) + '...');
                return caption.replace(/^["']|["']$/g, '');
            }

            console.warn('[AI] Hugging Face returned empty caption');
        } catch (error: any) {
            console.error('[AI] Hugging Face error:', error.message);
        }
    }

    // Final fallback to template-based captions
    console.log('[AI] Using template fallback');
    return getFallbackCaption(prompt, tone);
}

/**
 * Generate caption mutations for evolution with fallback
 */
export async function generateMutations(
    options: MutationOptions,
    count: number = 3
): Promise<string[]> {
    const { originalCaption, feedback, mutationType = 'variation' } = options;

    const mutationPrompts: Record<string, string> = {
        variation: 'Create variations with different wording but same humor',
        'tone-shift': 'Change the tone while keeping the core message',
        'format-change': 'Reformat (e.g., add emojis, change structure)',
    };

    const systemPrompt = `You are evolving meme captions. Generate ${count} different mutations.
Original caption: "${originalCaption}"
Mutation type: ${mutationPrompts[mutationType]}
${feedback ? `User feedback: ${feedback}` : ''}

Return ONLY the ${count} new captions, one per line, no numbering or explanations.`;

    // Try OpenRouter first
    if (OPENROUTER_API_KEY) {
        try {
            console.log('[AI] Generating mutations with OpenRouter...');

            const response = await openRouterClient.chat.completions.create({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'Generate the mutations now.' },
                ],
                temperature: 1.0,
                max_tokens: 300,
            });

            const content = response.choices[0]?.message?.content?.trim() || '';
            const mutations = content
                .split('\n')
                .map((line) => line.replace(/^["'\d.\-\s]+|["']$/g, '').trim())
                .filter((line) => line.length > 0)
                .slice(0, count);

            if (mutations.length > 0) {
                console.log('[AI] OpenRouter mutations:', mutations.length);
                return mutations;
            }

            console.warn('[AI] OpenRouter returned no mutations, trying fallback...');
        } catch (error: any) {
            console.error('[AI] OpenRouter mutations error:', error.message);
        }
    }

    // Fallback to Hugging Face
    if (huggingFaceClient) {
        try {
            console.log('[AI] Generating mutations with Hugging Face...');
            const result = await callHuggingFace(systemPrompt, 'Generate the mutations now.');

            const mutations = result
                .split('\n')
                .map((line) => line.replace(/^["'\d.\-\s]+|["']$/g, '').trim())
                .filter((line) => line.length > 0)
                .slice(0, count);

            if (mutations.length > 0) {
                console.log('[AI] Hugging Face mutations:', mutations.length);
                return mutations;
            }
        } catch (error: any) {
            console.error('[AI] Hugging Face mutations error:', error.message);
        }
    }

    // Final fallback
    console.log('[AI] Using fallback mutations');
    return [originalCaption];
}

/**
 * Generate alt-text for accessibility
 */
export async function generateAltText(
    caption: string,
    templateName: string
): Promise<string> {
    const prompt = `Template: ${templateName}\nCaption: ${caption}\n\nGenerate alt-text:`;
    const systemPrompt = 'Generate concise alt-text for meme images for accessibility. Describe the meme template and caption.';

    // Try OpenRouter
    if (OPENROUTER_API_KEY) {
        try {
            const response = await openRouterClient.chat.completions.create({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.5,
                max_tokens: 100,
            });

            const altText = response.choices[0]?.message?.content?.trim();
            if (altText) return altText;
        } catch (error: any) {
            console.error('[AI] Alt-text error:', error.message);
        }
    }

    // Fallback
    return `Meme with caption: ${caption}`;
}

/**
 * Fallback caption generator (template-based)
 */
function getFallbackCaption(prompt: string, tone: string): string {
    const templates: Record<string, string[]> = {
        funny: [
            `When ${prompt} hits different`,
            `POV: ${prompt}`,
            `Nobody:\nAbsolutely nobody:\n${prompt}:`,
            `${prompt} be like`,
        ],
        sarcastic: [
            `Oh great, ${prompt}. Just what I needed.`,
            `${prompt}? Shocking. Absolutely shocking.`,
            `Wow, ${prompt}. Never saw that coming.`,
        ],
        wholesome: [
            `${prompt} and that's beautiful`,
            `Appreciate ${prompt} today`,
            `${prompt} makes everything better`,
        ],
        dark: [
            `${prompt}: A tragedy in 3 acts`,
            `The ${prompt} incident`,
            `${prompt} (gone wrong)`,
        ],
        random: [
            `${prompt}`,
            `It's ${prompt} time`,
            `${prompt} moment`,
        ],
    };

    const toneTemplates = templates[tone] || templates.random;
    return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
    // Test OpenRouter
    if (OPENROUTER_API_KEY) {
        try {
            const response = await openRouterClient.chat.completions.create({
                model: OPENROUTER_MODEL,
                messages: [{ role: 'user', content: 'Say "OK" if you can read this.' }],
                max_tokens: 10,
            });

            if (response.choices[0]?.message?.content) {
                console.log('[AI] OpenRouter connection: OK');
                return true;
            }
        } catch (error: any) {
            console.error('[AI] OpenRouter connection failed:', error.message);
        }
    }

    // Test Hugging Face
    if (huggingFaceClient) {
        try {
            await callHuggingFace('You are a helpful assistant.', 'Say OK');
            console.log('[AI] Hugging Face connection: OK');
            return true;
        } catch (error: any) {
            console.error('[AI] Hugging Face connection failed:', error.message);
        }
    }

    return false;
}
