export interface MemeTemplate {
    id: string;
    name: string;
    filename: string;
    width: number;
    height: number;
    textZones: TextZone[];
    tags: string[];
    popularity: number;
}

export interface TextZone {
    id: string;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
    align: 'left' | 'center' | 'right';
    valign: 'top' | 'middle' | 'bottom';
    maxFontSize: number;
    minFontSize: number;
}

/**
 * Popular meme templates library
 * Templates are stored in public/templates/
 */
export const MEME_TEMPLATES: MemeTemplate[] = [
    {
        id: 'drake',
        name: 'Drake Hotline Bling',
        filename: 'drake.jpg',
        width: 1200,
        height: 1200,
        textZones: [
            {
                id: 'top',
                x: 50,
                y: 10,
                width: 45,
                height: 40,
                align: 'left',
                valign: 'middle',
                maxFontSize: 48,
                minFontSize: 24,
            },
            {
                id: 'bottom',
                x: 50,
                y: 55,
                width: 45,
                height: 40,
                align: 'left',
                valign: 'middle',
                maxFontSize: 48,
                minFontSize: 24,
            },
        ],
        tags: ['reaction', 'choice', 'preference'],
        popularity: 100,
    },
    {
        id: 'distracted-boyfriend',
        name: 'Distracted Boyfriend',
        filename: 'distracted-boyfriend.jpg',
        width: 1200,
        height: 800,
        textZones: [
            {
                id: 'girlfriend',
                x: 5,
                y: 5,
                width: 25,
                height: 15,
                align: 'center',
                valign: 'top',
                maxFontSize: 36,
                minFontSize: 20,
            },
            {
                id: 'guy',
                x: 40,
                y: 5,
                width: 20,
                height: 15,
                align: 'center',
                valign: 'top',
                maxFontSize: 36,
                minFontSize: 20,
            },
            {
                id: 'other-girl',
                x: 75,
                y: 5,
                width: 20,
                height: 15,
                align: 'center',
                valign: 'top',
                maxFontSize: 36,
                minFontSize: 20,
            },
        ],
        tags: ['relationship', 'distraction', 'choice'],
        popularity: 95,
    },
    {
        id: 'two-buttons',
        name: 'Two Buttons',
        filename: 'two-buttons.jpg',
        width: 600,
        height: 908,
        textZones: [
            {
                id: 'left-button',
                x: 10,
                y: 30,
                width: 35,
                height: 15,
                align: 'center',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
            {
                id: 'right-button',
                x: 55,
                y: 30,
                width: 35,
                height: 15,
                align: 'center',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
        ],
        tags: ['decision', 'choice', 'struggle'],
        popularity: 90,
    },
    {
        id: 'expanding-brain',
        name: 'Expanding Brain',
        filename: 'expanding-brain.jpg',
        width: 857,
        height: 1202,
        textZones: [
            {
                id: 'level1',
                x: 50,
                y: 5,
                width: 45,
                height: 20,
                align: 'left',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
            {
                id: 'level2',
                x: 50,
                y: 28,
                width: 45,
                height: 20,
                align: 'left',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
            {
                id: 'level3',
                x: 50,
                y: 52,
                width: 45,
                height: 20,
                align: 'left',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
            {
                id: 'level4',
                x: 50,
                y: 76,
                width: 45,
                height: 20,
                align: 'left',
                valign: 'middle',
                maxFontSize: 32,
                minFontSize: 18,
            },
        ],
        tags: ['intelligence', 'progression', 'comparison'],
        popularity: 85,
    },
    {
        id: 'change-my-mind',
        name: 'Change My Mind',
        filename: 'change-my-mind.jpg',
        width: 1200,
        height: 900,
        textZones: [
            {
                id: 'sign',
                x: 25,
                y: 60,
                width: 50,
                height: 25,
                align: 'center',
                valign: 'middle',
                maxFontSize: 40,
                minFontSize: 24,
            },
        ],
        tags: ['opinion', 'debate', 'statement'],
        popularity: 88,
    },
    {
        id: 'is-this',
        name: 'Is This A Pigeon',
        filename: 'is-this.jpg',
        width: 1200,
        height: 900,
        textZones: [
            {
                id: 'person',
                x: 10,
                y: 5,
                width: 25,
                height: 15,
                align: 'center',
                valign: 'top',
                maxFontSize: 36,
                minFontSize: 20,
            },
            {
                id: 'butterfly',
                x: 60,
                y: 5,
                width: 30,
                height: 15,
                align: 'center',
                valign: 'top',
                maxFontSize: 36,
                minFontSize: 20,
            },
            {
                id: 'question',
                x: 30,
                y: 80,
                width: 40,
                height: 15,
                align: 'center',
                valign: 'bottom',
                maxFontSize: 40,
                minFontSize: 24,
            },
        ],
        tags: ['confusion', 'misunderstanding', 'question'],
        popularity: 82,
    },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MemeTemplate | undefined {
    return MEME_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get random template
 */
export function getRandomTemplate(): MemeTemplate {
    const totalPopularity = MEME_TEMPLATES.reduce((sum, t) => sum + t.popularity, 0);
    let random = Math.random() * totalPopularity;

    for (const template of MEME_TEMPLATES) {
        random -= template.popularity;
        if (random <= 0) return template;
    }

    return MEME_TEMPLATES[0];
}

/**
 * Search templates by tags
 */
export function searchTemplates(query: string): MemeTemplate[] {
    const lowerQuery = query.toLowerCase();
    return MEME_TEMPLATES.filter(
        (t) =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.tags.some((tag) => tag.includes(lowerQuery))
    ).sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get templates by tags
 */
export function getTemplatesByTags(tags: string[]): MemeTemplate[] {
    return MEME_TEMPLATES.filter((t) =>
        tags.some((tag) => t.tags.includes(tag))
    ).sort((a, b) => b.popularity - a.popularity);
}
