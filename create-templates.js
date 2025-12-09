// Script to create placeholder meme templates
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const templates = [
    { name: 'drake.jpg', width: 1200, height: 1200, color: '#87CEEB', text: 'DRAKE' },
    { name: 'distracted-boyfriend.jpg', width: 1200, height: 800, color: '#90EE90', text: 'DISTRACTED\nBOYFRIEND' },
    { name: 'two-buttons.jpg', width: 600, height: 908, color: '#FFE4B5', text: 'TWO\nBUTTONS' },
    { name: 'expanding-brain.jpg', width: 857, height: 1202, color: '#FFB6C1', text: 'EXPANDING\nBRAIN' },
    { name: 'change-my-mind.jpg', width: 1200, height: 900, color: '#E0FFFF', text: 'CHANGE\nMY MIND' },
    { name: 'is-this.jpg', width: 1200, height: 900, color: '#E6E6FA', text: 'IS THIS\nA PIGEON?' },
];

const outputDir = path.join(__dirname, 'public', 'templates');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createTemplate(template) {
    const { name, width, height, color, text } = template;

    // Create SVG with text
    const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="72"
        font-weight="bold"
        fill="#333"
        text-anchor="middle"
        dominant-baseline="middle"
      >${text}</text>
    </svg>
  `;

    const outputPath = path.join(outputDir, name);

    await sharp(Buffer.from(svg))
        .jpeg({ quality: 90 })
        .toFile(outputPath);

    console.log(`✅ Created: ${name}`);
}

async function createAllTemplates() {
    console.log('🎨 Creating placeholder meme templates...\n');

    for (const template of templates) {
        try {
            await createTemplate(template);
        } catch (error) {
            console.error(`❌ Failed to create ${template.name}:`, error.message);
        }
    }

    console.log('\n🎉 All templates created successfully!');
    console.log(`📁 Templates saved to: ${outputDir}`);
}

createAllTemplates().catch(console.error);
