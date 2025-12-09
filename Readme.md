# EvoMeme AI - Evolutionary Meme Generator

A production-ready, free meme generator powered by AI with automatic fallback system. Users can create memes with AI-generated captions and evolve them through intelligent mutations.

## 🎯 Key Features

### Core Functionality
- 🤖 **Dual AI System**: OpenRouter (primary) + Hugging Face (fallback) with automatic switching
- 🧬 **Evolution Engine**: Generate caption variations, tone shifts, and template swaps
- 💬 **Text-Only Mode**: Get AI meme presentation ideas without generating images
- 🌍 **Multi-Language**: Support for 50+ languages
- 🎨 **6 Popular Templates**: Drake, Distracted Boyfriend, Two Buttons, Expanding Brain, Change My Mind, Is This
- 📊 **Analytics Tracking**: Session-based analytics with evolution history
- 🚀 **100% Free**: No ads, no paywalls, completely open source
- ⚡ **Smart Rate Limiting**: 5 requests/minute with IP-based tracking
- 📱 **Responsive Design**: Mobile-first with Mantine UI

### AI Models
- **Primary**: `arcee-ai/trinity-mini:free` (OpenRouter)
- **Fallback**: `allenai/Olmo-3-7B-Instruct:publicai` (Hugging Face Router)
- **Retry Logic**: 10-second retry for rate limits, 5-second retry for model loading
- **Length Enforcement**: Automatic 100-character caption limit

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5, React 19, TypeScript
- **UI Library**: Mantine UI 7.15 (dark/light mode, notifications, forms)
- **Backend**: Next.js API Routes
- **AI Services**: 
  - OpenRouter API (primary)
  - Hugging Face Inference Router (fallback)
  - Template-based fallback (offline mode)
- **Database**: JSON-based storage (`data/evomeme.json`)
- **Image Processing**: Sharp (text overlay, optimization)
- **Validation**: Zod schemas
- **Rate Limiting**: rate-limiter-flexible with IP hashing
- **Icons**: Tabler Icons React

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- OpenRouter API key (free tier: https://openrouter.ai)
- Hugging Face Access Token (free: https://huggingface.co/settings/tokens)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Meme-Generator
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenRouter API (Primary AI Service)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=arcee-ai/trinity-mini:free

# Hugging Face API (Fallback AI Service)
HUGGING_FACE_ACCESS_TOKEN=your_huggingface_token_here
HUGGING_FACE_MODEL=allenai/Olmo-3-7B-Instruct:publicai

# Admin Dashboard
ADMIN_PASSWORD=your_secure_password_here

# Rate Limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=60000

# reCAPTCHA (Optional)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 3. Add Meme Templates

Create `public/templates/` directory and add template images:

```bash
mkdir -p public/templates
```

Required template files (download from meme sites or create placeholders):
- `drake.jpg` (Drake Hotline Bling)
- `distracted-boyfriend.jpg` (Distracted Boyfriend)
- `two-buttons.jpg` (Two Buttons)
- `expanding-brain.jpg` (Expanding Brain)
- `change-my-mind.jpg` (Change My Mind)
- `is-this.jpg` (Is This a Pigeon?)

See `TEMPLATE_SETUP.md` for detailed instructions on obtaining templates.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Test AI Connection

```bash
# Test OpenRouter + Hugging Face fallback
node test-caption-standalone.js

# Test full API endpoint
node test-generate.js

# Test text-only mode
node test-text-only.js
```

Expected output:
- OpenRouter: May be rate-limited (429 error)
- Hugging Face: Should generate caption successfully
- Template fallback: Always works

## 📦 Deployment to Hostinger

### Build for Production

```bash
npm run build
```

This creates a standalone build in `.next/standalone/`.

### Upload to Server

1. **Via SFTP/FTP**, upload:
   - `.next/standalone/*` → `/home/username/evomeme-ai/`
   - `public/*` → `/home/username/evomeme-ai/public/`
   - `.env.local` → `/home/username/evomeme-ai/.env.local`
   - `data/` → `/home/username/evomeme-ai/data/` (create if doesn't exist)

2. **SSH into server**:
   ```bash
   ssh username@your-server.com
   cd ~/evomeme-ai
   ```

3. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   ```

4. **Start application**:
   ```bash
   pm2 start server.js --name "evomeme-ai"
   pm2 save
   pm2 startup
   ```

5. **Configure reverse proxy** (Apache/Nginx):
   
   **Apache** (`.htaccess` or virtual host):
   ```apache
   ProxyPass / http://localhost:3000/
   ProxyPassReverse / http://localhost:3000/
   ```

   **Nginx**:
   ```nginx
   location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

6. **Verify deployment**:
   ```bash
   pm2 status
   pm2 logs evomeme-ai
   ```

## 📡 API Documentation

### POST /api/generate

Generate a new meme with AI caption.

**Request:**
```json
{
  "prompt": "Monday morning",
  "tone": "funny",
  "language": "en",
  "templateId": "drake",
  "generateImageMode": true
}
```

**Parameters:**
- `prompt` (string, required): Topic or idea for the meme
- `tone` (string, optional): `funny`, `sarcastic`, `wholesome`, `dark`, `random` (default: `funny`)
- `language` (string, optional): Language code (default: `en`)
- `templateId` (string, optional): Specific template ID or random if omitted
- `generateImageMode` (boolean, optional): `true` for image, `false` for text-only ideas (default: `true`)

**Response (Image Mode):**
```json
{
  "success": true,
  "meme": {
    "id": "abc123xyz",
    "imageUrl": "/generated/abc123xyz.jpg",
    "caption": "When Monday hits you like a Wi-Fi drop",
    "templateId": "drake",
    "templateName": "Drake Hotline Bling"
  },
  "generationTime": 5273
}
```

**Response (Text-Only Mode):**
```json
{
  "success": true,
  "textOnly": true,
  "meme": {
    "id": "abc123xyz",
    "caption": "When Monday hits you like a Wi-Fi drop",
    "memeIdea": {
      "templateSuggestion": "Drake Hotline Bling",
      "visualDescription": "Show Drake rejecting alarm clock, accepting coffee",
      "textPlacement": "Top: 'Waking up on time', Bottom: 'Hitting snooze 5 times'",
      "styleNotes": "Use Impact font, white text with black outline"
    }
  },
  "generationTime": 6012
}
```

### POST /api/evolve

Evolve an existing meme with mutations.

**Request:**
```json
{
  "memeId": "abc123xyz",
  "feedback": "make it funnier",
  "mutationType": "variation"
}
```

**Parameters:**
- `memeId` (string, required): ID of meme to evolve
- `feedback` (string, optional): User feedback for AI
- `mutationType` (string, optional): `variation`, `tone-shift`, `format-change` (default: `variation`)

**Response:**
```json
{
  "success": true,
  "mutations": [
    {
      "id": "def456ghi",
      "imageUrl": "/generated/def456ghi.jpg",
      "caption": "When Monday absolutely destroys your soul",
      "mutationType": "variation"
    },
    {
      "id": "jkl789mno",
      "imageUrl": "/generated/jkl789mno.jpg",
      "caption": "Monday morning: 404 motivation not found",
      "mutationType": "variation"
    }
  ],
  "evolutionTree": {
    "parentId": "abc123xyz",
    "generation": 2,
    "mutations": 3
  }
}
```

## 🗂️ Project Structure

```
evomeme-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts      # Meme generation endpoint
│   │   │   └── evolve/route.ts        # Evolution endpoint
│   │   ├── generate/page.tsx          # Generator UI
│   │   ├── layout.tsx                 # Root layout with Mantine
│   │   └── page.tsx                   # Homepage
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── caption-generator.ts   # AI service with fallback
│   │   │   ├── evolution-engine.ts    # Mutation logic
│   │   │   └── meme-idea-generator.ts # Text-only mode
│   │   ├── db/
│   │   │   ├── index.ts               # JSON database
│   │   │   └── schema.sql             # Schema reference
│   │   ├── meme/
│   │   │   ├── generator.ts           # Image generation (Sharp)
│   │   │   └── templates.ts           # Template definitions
│   │   └── utils/
│   │       ├── rate-limiter.ts        # Rate limiting
│   │       └── validation.ts          # Zod schemas
├── public/
│   ├── templates/                     # Meme template images
│   └── generated/                     # Generated memes
├── data/
│   └── evomeme.json                   # Database file
├── test-caption-standalone.js         # AI fallback test
├── test-generate.js                   # API endpoint test
├── test-text-only.js                  # Text-only mode test
├── .env.example                       # Environment template
├── next.config.js                     # Next.js configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes |
| `OPENROUTER_MODEL` | OpenRouter model | `arcee-ai/trinity-mini:free` | No |
| `HUGGING_FACE_ACCESS_TOKEN` | HF access token | - | Yes |
| `HUGGING_FACE_MODEL` | HF model | `allenai/Olmo-3-7B-Instruct:publicai` | No |
| `ADMIN_PASSWORD` | Admin dashboard password | - | Yes |
| `RATE_LIMIT_MAX` | Max requests per window | `5` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` | No |

### AI Model Configuration

The app uses a three-tier fallback system:

1. **OpenRouter** (Primary)
   - Model: `arcee-ai/trinity-mini:free`
   - Free tier with daily limits
   - 10-second retry on rate limit (429)

2. **Hugging Face Router** (Fallback)
   - Model: `allenai/Olmo-3-7B-Instruct:publicai`
   - Free inference via publicai provider
   - 5-second retry on model loading (503)

3. **Template Fallback** (Last Resort)
   - Pre-defined caption templates
   - Always available offline

## 🐛 Troubleshooting

### "Template not found" Error
- Ensure all 6 template images are in `public/templates/`
- Check filenames match exactly (lowercase, no spaces)
- Verify images are valid JPG/PNG format

### AI Connection Failed
- Verify `OPENROUTER_API_KEY` is correct
- Check `HUGGING_FACE_ACCESS_TOKEN` is valid
- Run `node test-caption-standalone.js` to diagnose
- Check API dashboards for quota/limits

### Empty Captions
- This is normal AI behavior (~30% of time)
- Fallback system will try HF, then templates
- Check console logs for detailed error messages

### Rate Limit Errors
- Default: 5 requests/minute per IP
- Adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`
- Restart server to clear rate limit cache

### Database Errors
- Ensure `data/` directory exists and is writable
- Delete `data/evomeme.json` to reset database
- Check file permissions on server

### Port Already in Use
- Kill process: `lsof -ti:3000 | xargs kill`
- Or change port: `PORT=3001 npm run dev`

## 🔒 Security

- ✅ Rate limiting on all API endpoints
- ✅ Input validation with Zod schemas
- ✅ IP hashing for privacy (SHA-256)
- ✅ No user authentication required (anonymous)
- ✅ Environment variables for sensitive data
- ✅ CORS protection
- ✅ SQL injection prevention (parameterized queries)

## ⚡ Performance

- Images optimized with Sharp (WebP/AVIF support)
- Rate limiting prevents abuse
- Database auto-saves every 30 seconds
- Static assets cached by Next.js
- Lazy loading for images
- API response caching

## 📊 Analytics

The app tracks (anonymously):
- Total memes generated
- Evolution chains
- Popular templates
- API response times
- Error rates
- Rate limit hits

Access via database queries or future admin dashboard.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - Free to use for any purpose

## 🙏 Acknowledgments

- OpenRouter for free AI API access
- Hugging Face for inference infrastructure
- Mantine UI for beautiful components
- Next.js team for amazing framework

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Documentation: See this README and code comments
- Testing: Run test scripts for diagnostics

---

**Built with ❤️ using Next.js, OpenRouter AI, and Hugging Face**

**Status**: Production-ready with complete AI fallback system ✅
