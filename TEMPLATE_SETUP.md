# Meme Template Setup Guide

Since we cannot generate the template images automatically, you have two options:

## Option 1: Download from Meme Template Sites

Visit these sites and download the templates:
- [Imgflip Meme Templates](https://imgflip.com/memetemplates)
- [Know Your Meme](https://knowyourmeme.com/)

Search for and download:
1. **drake.jpg** - Drake Hotline Bling (2 panels, vertical)
2. **distracted-boyfriend.jpg** - Distracted Boyfriend
3. **two-buttons.jpg** - Two Buttons / Daily Struggle
4. **expanding-brain.jpg** - Expanding Brain (4 levels)
5. **change-my-mind.jpg** - Change My Mind (Crowder)
6. **is-this.jpg** - Is This A Pigeon?

Save them to `public/templates/` with the exact filenames above.

## Option 2: Use Placeholder Images (for testing)

Create simple colored rectangles as placeholders:

```bash
# Install ImageMagick (if not already installed)
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Create placeholder templates
cd public/templates

# Drake (1200x1200)
convert -size 1200x1200 xc:lightblue -pointsize 72 -draw "text 100,600 'DRAKE TEMPLATE'" drake.jpg

# Distracted Boyfriend (1200x800)
convert -size 1200x800 xc:lightgreen -pointsize 72 -draw "text 100,400 'DISTRACTED BOYFRIEND'" distracted-boyfriend.jpg

# Two Buttons (600x908)
convert -size 600x908 xc:lightyellow -pointsize 48 -draw "text 100,450 'TWO BUTTONS'" two-buttons.jpg

# Expanding Brain (857x1202)
convert -size 857x1202 xc:lightpink -pointsize 48 -draw "text 100,600 'EXPANDING BRAIN'" expanding-brain.jpg

# Change My Mind (1200x900)
convert -size 1200x900 xc:lightcyan -pointsize 72 -draw "text 100,450 'CHANGE MY MIND'" change-my-mind.jpg

# Is This (1200x900)
convert -size 1200x900 xc:lavender -pointsize 72 -draw "text 100,450 'IS THIS A PIGEON'" is-this.jpg
```

## Option 3: Manual Creation (Simplest for Testing)

Create 6 blank images with any image editor:
- Size: 1200x800 pixels
- Format: JPEG
- Color: Any solid color
- Save with the filenames listed above

The text overlay system will work regardless of the base image!

## Verify Templates

After adding templates, verify they exist:

```bash
ls -la public/templates/
```

You should see all 6 .jpg files.

## Test the Application

```bash
npm run dev
```

Visit http://localhost:3000/generate and try generating a meme!
