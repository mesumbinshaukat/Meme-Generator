import OpenAI from 'openai';

export interface MemeIdeaOptions {
    prompt: string;
    caption: string;
    tone?: string;
}

export interface MemeIdea {
    templateSuggestion: string;
    visualDescription: string;
    textPlacement: string;
    styleNotes: string;
}

/**
 * Generate meme presentation ideas without creating the actual image
 * This is for text-only mode where AI suggests how to present the meme
 */
export async function generateMemeIdea(options: MemeIdeaOptions): Promise<MemeIdea> {
    const { prompt, caption, tone = 'funny' } = options;

    // Use environment variables - NO HARDCODED VALUES
    const API_KEY = process.env.OPENROUTER_API_KEY || '';
    const MODEL = process.env.OPENROUTER_MODEL || 'arcee-ai/trinity-mini:free';
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const openai = new OpenAI({
        apiKey: API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': APP_URL,
            'X-Title': 'EvoMeme AI',
        },
    });

    const systemPrompt = `You are a meme design expert. Given a meme caption and context, suggest how to visually present it as a meme.

Provide your response in this exact JSON format:
{
  "templateSuggestion": "Name of meme template that would work best (e.g., Drake, Distracted Boyfriend, etc.)",
  "visualDescription": "Describe what the image should show (2-3 sentences)",
  "textPlacement": "Where and how to place the text (top/bottom, split, overlay, etc.)",
  "styleNotes": "Additional style suggestions (font, colors, effects)"
}`;

    const userPrompt = `Context: ${prompt}
Caption: "${caption}"
Tone: ${tone}

Suggest how to present this as a meme.`;

    try {
        console.log('[Meme Idea] Generating presentation suggestion...');

        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const content = response.choices[0]?.message?.content?.trim() || '';
        console.log('[Meme Idea] Raw response:', content);

        // Try to parse JSON response
        try {
            const parsed = JSON.parse(content);
            return {
                templateSuggestion: parsed.templateSuggestion || 'Classic meme format',
                visualDescription: parsed.visualDescription || 'A relatable image that captures the mood',
                textPlacement: parsed.textPlacement || 'Text at top and bottom',
                styleNotes: parsed.styleNotes || 'Bold white text with black outline',
            };
        } catch (parseError) {
            // If JSON parsing fails, create a structured response from the text
            return {
                templateSuggestion: 'Custom meme format',
                visualDescription: content.substring(0, 200) || 'Create a visual that matches the caption\'s energy',
                textPlacement: 'Center or top/bottom split',
                styleNotes: 'Use bold, readable fonts with high contrast',
            };
        }
    } catch (error: any) {
        console.error('[Meme Idea] Error:', error.message);

        // Fallback suggestion
        return {
            templateSuggestion: tone === 'funny' ? 'Drake Hotline Bling' : 'Distracted Boyfriend',
            visualDescription: `A ${tone} image that represents: ${prompt}. The visual should complement the caption: "${caption}"`,
            textPlacement: 'Split the caption across top and bottom of the image',
            styleNotes: 'Use Impact font, white text with black outline for maximum readability',
        };
    }
}
