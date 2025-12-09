import { z } from 'zod';

/**
 * Validation schemas for API requests
 */

export const GenerateMemeSchema = z.object({
    prompt: z.string().min(1).max(500),
    language: z.string().optional().default('en'),
    tone: z.enum(['funny', 'sarcastic', 'wholesome', 'dark', 'random']).optional().default('funny'),
    templateId: z.string().optional(),
    generateImageMode: z.boolean().optional().default(true), // true = generate image, false = text-only with ideas
});

export const EvolveMemeSchema = z.object({
    memeId: z.string().min(1),
    feedback: z.string().max(200).optional(),
    mutationType: z.enum(['variation', 'tone-shift', 'format-change', 'template-swap']).optional(),
});

export const UploadTemplateSchema = z.object({
    file: z.any(), // Will be validated separately
    name: z.string().min(1).max(100).optional(),
});

export const ShareMemeSchema = z.object({
    memeId: z.string().min(1),
    expiresIn: z.number().min(3600).max(2592000).optional(), // 1 hour to 30 days
});

export const AdminLoginSchema = z.object({
    password: z.string().min(1),
});

export type GenerateMemeInput = z.infer<typeof GenerateMemeSchema>;
export type EvolveMemeInput = z.infer<typeof EvolveMemeSchema>;
export type UploadTemplateInput = z.infer<typeof UploadTemplateSchema>;
export type ShareMemeInput = z.infer<typeof ShareMemeSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
