import { generateCaption, generateMutations } from '../ai/caption-generator';
import { MemeTemplate, getTemplateById, getRandomTemplate } from './templates';

export interface EvolutionNode {
    memeId: string;
    caption: string;
    templateId: string;
    mutationType?: string;
    children: EvolutionNode[];
    depth: number;
}

export type MutationType = 'variation' | 'tone-shift' | 'format-change' | 'template-swap';

/**
 * Evolution engine for generating meme mutations
 */
export class EvolutionEngine {
    /**
     * Generate initial meme variations
     */
    async generateVariations(
        originalCaption: string,
        count: number = 3
    ): Promise<string[]> {
        return generateMutations({ originalCaption, mutationType: 'variation' }, count);
    }

    /**
     * Evolve a meme based on user feedback
     */
    async evolveMeme(
        caption: string,
        feedback?: string,
        mutationType: MutationType = 'variation'
    ): Promise<string[]> {
        return generateMutations({ originalCaption: caption, feedback, mutationType }, 3);
    }

    /**
     * Generate template swap suggestions
     */
    async suggestTemplateSwaps(
        currentTemplate: MemeTemplate,
        caption: string
    ): Promise<MemeTemplate[]> {
        // Simple tag-based matching for now
        // In production, could use AI to analyze caption and suggest best templates
        const suggestions: MemeTemplate[] = [];

        // Get templates with similar tags
        const allTemplates = await import('./templates').then((m) => m.MEME_TEMPLATES);

        for (const template of allTemplates) {
            if (template.id === currentTemplate.id) continue;

            const commonTags = template.tags.filter((tag) =>
                currentTemplate.tags.includes(tag)
            );

            if (commonTags.length > 0) {
                suggestions.push(template);
            }
        }

        // Sort by popularity and return top 3
        return suggestions.sort((a, b) => b.popularity - a.popularity).slice(0, 3);
    }

    /**
     * Calculate fitness score for a meme
     * (simulated based on various factors)
     */
    calculateFitness(meme: {
        caption: string;
        shares: number;
        evolutions: number;
        age: number; // in hours
    }): number {
        let score = 0;

        // Caption length (sweet spot: 30-80 chars)
        const captionLength = meme.caption.length;
        if (captionLength >= 30 && captionLength <= 80) {
            score += 20;
        } else {
            score += Math.max(0, 20 - Math.abs(captionLength - 55) / 2);
        }

        // Shares (exponential value)
        score += Math.min(40, meme.shares * 5);

        // Evolutions (shows engagement)
        score += Math.min(30, meme.evolutions * 3);

        // Recency bonus (newer memes get slight boost)
        if (meme.age < 24) {
            score += 10 * (1 - meme.age / 24);
        }

        return Math.round(score);
    }

    /**
     * Build evolution tree from database records
     */
    buildEvolutionTree(
        memes: Array<{
            id: string;
            parent_id: string | null;
            caption: string;
            template_id: string;
            mutation_type?: string;
        }>
    ): EvolutionNode[] {
        const nodeMap = new Map<string, EvolutionNode>();
        const roots: EvolutionNode[] = [];

        // Create all nodes
        for (const meme of memes) {
            nodeMap.set(meme.id, {
                memeId: meme.id,
                caption: meme.caption,
                templateId: meme.template_id,
                mutationType: meme.mutation_type,
                children: [],
                depth: 0,
            });
        }

        // Build tree structure
        for (const meme of memes) {
            const node = nodeMap.get(meme.id)!;

            if (meme.parent_id) {
                const parent = nodeMap.get(meme.parent_id);
                if (parent) {
                    parent.children.push(node);
                    node.depth = parent.depth + 1;
                }
            } else {
                roots.push(node);
            }
        }

        return roots;
    }

    /**
     * Get evolution path from root to specific meme
     */
    getEvolutionPath(
        tree: EvolutionNode[],
        targetMemeId: string
    ): EvolutionNode[] | null {
        function search(nodes: EvolutionNode[], path: EvolutionNode[]): EvolutionNode[] | null {
            for (const node of nodes) {
                const newPath = [...path, node];

                if (node.memeId === targetMemeId) {
                    return newPath;
                }

                if (node.children.length > 0) {
                    const result = search(node.children, newPath);
                    if (result) return result;
                }
            }

            return null;
        }

        return search(tree, []);
    }
}

export const evolutionEngine = new EvolutionEngine();
