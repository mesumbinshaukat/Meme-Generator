// Meme templates definition
export interface MemeTemplate {
    id: string;
    name: string;
    url: string; // public URL or path to image
    tags: string[]; // tags for similarity matching
    popularity: number; // usage count for sorting suggestions
}

export const MEME_TEMPLATES: MemeTemplate[] = [
    {
        id: 'drake',
        name: 'Drake Hotline Bling',
        url: '/templates/drake.jpg',
        tags: ['drake', 'hotline', 'blessing', 'reject'],
        popularity: 120,
    },
    {
        id: 'distracted',
        name: 'Distracted Boyfriend',
        url: '/templates/distracted.jpg',
        tags: ['distracted', 'boyfriend', 'girlfriend', 'other'],
        popularity: 95,
    },
    {
        id: 'two_buttons',
        name: 'Two Buttons',
        url: '/templates/two_buttons.jpg',
        tags: ['choice', 'buttons', 'decision'],
        popularity: 80,
    },
    {
        id: 'expanding_brain',
        name: 'Expanding Brain',
        url: '/templates/expanding_brain.jpg',
        tags: ['brain', 'expanding', 'intelligence'],
        popularity: 70,
    },
    {
        id: 'change_my_mind',
        name: 'Change My Mind',
        url: '/templates/change_my_mind.jpg',
        tags: ['change', 'mind', 'debate'],
        popularity: 60,
    },
    {
        id: 'mocking_spongebob',
        name: 'Mocking SpongeBob',
        url: '/templates/mocking_spongebob.jpg',
        tags: ['mocking', 'spongebob', 'sarcasm'],
        popularity: 55,
    },
];

export function getTemplateById(id: string): MemeTemplate | undefined {
    return MEME_TEMPLATES.find((t) => t.id === id);
}

export function getRandomTemplate(): MemeTemplate {
    const idx = Math.floor(Math.random() * MEME_TEMPLATES.length);
    return MEME_TEMPLATES[idx];
}
