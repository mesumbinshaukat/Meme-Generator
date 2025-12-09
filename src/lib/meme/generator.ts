import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { MemeTemplate, TextZone } from './templates';

export interface GenerateMemeOptions {
    template: MemeTemplate;
    texts: Record<string, string>; // zone id -> text
    outputPath: string;
}

/**
 * Generate a meme image with text overlays
 */
export async function generateMeme(options: GenerateMemeOptions): Promise<string> {
    const { template, texts, outputPath } = options;

    const templatePath = path.join(process.cwd(), 'public', 'templates', template.filename);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${template.filename}`);
    }

    // Load base image
    let image = sharp(templatePath);

    // Get image metadata
    const metadata = await image.metadata();
    const width = metadata.width || template.width;
    const height = metadata.height || template.height;

    // Create SVG overlays for each text zone
    const svgOverlays: string[] = [];

    for (const zone of template.textZones) {
        const text = texts[zone.id];
        if (!text) continue;

        const svg = createTextSVG(text, zone, width, height);
        svgOverlays.push(svg);
    }

    // Composite all text overlays
    if (svgOverlays.length > 0) {
        const composites = svgOverlays.map((svg) => ({
            input: Buffer.from(svg),
            top: 0,
            left: 0,
        }));

        image = image.composite(composites);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the final image
    await image.jpeg({ quality: 90 }).toFile(outputPath);

    return outputPath;
}

/**
 * Create SVG text overlay for a text zone
 */
function createTextSVG(
    text: string,
    zone: TextZone,
    imageWidth: number,
    imageHeight: number
): string {
    const x = (zone.x / 100) * imageWidth;
    const y = (zone.y / 100) * imageHeight;
    const width = (zone.width / 100) * imageWidth;
    const height = (zone.height / 100) * imageHeight;

    // Calculate font size based on text length
    const baseSize = Math.min(zone.maxFontSize, Math.max(zone.minFontSize, width / text.length * 2));
    const fontSize = Math.floor(baseSize);

    // Text anchor based on alignment
    const textAnchor = zone.align === 'center' ? 'middle' : zone.align === 'right' ? 'end' : 'start';

    // Calculate text position within zone
    let textX = x;
    if (zone.align === 'center') textX = x + width / 2;
    else if (zone.align === 'right') textX = x + width;

    let textY = y + height / 2;
    if (zone.valign === 'top') textY = y + fontSize;
    else if (zone.valign === 'bottom') textY = y + height - fontSize / 2;

    // Wrap text if needed
    const lines = wrapText(text, Math.floor(width / (fontSize * 0.6)));

    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let startY = textY - (totalHeight / 2) + (lineHeight / 2);

    if (zone.valign === 'top') startY = y + fontSize;
    else if (zone.valign === 'bottom') startY = y + height - totalHeight + fontSize;

    const textElements = lines
        .map((line, i) => {
            const lineY = startY + i * lineHeight;
            return `
        <text
          x="${textX}"
          y="${lineY}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="white"
          stroke="black"
          stroke-width="${fontSize * 0.08}"
          text-anchor="${textAnchor}"
          dominant-baseline="middle"
        >${escapeXml(line.toUpperCase())}</text>
      `;
        })
        .join('');

    return `
    <svg width="${imageWidth}" height="${imageHeight}">
      ${textElements}
    </svg>
  `;
}

/**
 * Wrap text to fit within width
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine) lines.push(currentLine);

    return lines;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Validate uploaded image
 */
export async function validateUpload(
    buffer: Buffer
): Promise<{ valid: boolean; error?: string; metadata?: sharp.Metadata }> {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Check file size (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            return { valid: false, error: 'File too large (max 10MB)' };
        }

        // Check dimensions (max 4000x4000)
        if (metadata.width! > 4000 || metadata.height! > 4000) {
            return { valid: false, error: 'Image too large (max 4000x4000px)' };
        }

        // Check format
        const validFormats = ['jpeg', 'jpg', 'png', 'webp'];
        if (!validFormats.includes(metadata.format || '')) {
            return { valid: false, error: 'Invalid format (use JPEG, PNG, or WebP)' };
        }

        return { valid: true, metadata };
    } catch (error) {
        return { valid: false, error: 'Invalid image file' };
    }
}
