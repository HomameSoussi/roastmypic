# RoastMyPic 🔥

A viral web application that generates AI-powered roasts of user photos. Upload a photo, choose a roast style, and get hilariously roasted by AI in multiple languages and tones.

## 🎯 Features

- **Photo Upload**: Upload any image (PNG, JPG, GIF up to 5MB)
- **Multiple Roast Styles**:
  - 🇲🇦 Moroccan Savage (Darija)
  - 😊 Clean & Funny
  - 😈 Dark Humor
  - 😏 Flirty
  - 💼 Corporate Sarcasm
  - ☪️ Muslim Friendly
- **AI-Powered**: Uses OpenAI GPT-4 Vision API for intelligent roast generation
- **Safety First**: Built-in content moderation to keep roasts playful and safe
- **Modern UI**: Dark mode with pink accents, responsive design
- **Fast & Simple**: No login required, instant results

## 🧱 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI**: OpenAI GPT-4 Vision API (pluggable for Manus API)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
/
├─ app/
│  ├─ page.tsx                 # Main frontend UI
│  ├─ api/
│  │   └─ roast/
│  │        └─ route.ts        # API endpoint for roast generation
├─ lib/
│  └─ ai.ts                    # AI helper module
├─ public/
├─ .env.example                # Environment variables template
├─ .env.local                  # Local environment variables (gitignored)
├─ README.md                   # This file
└─ tailwind.config.ts          # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm (or npm/yarn)
- OpenAI API key (or Manus API key)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HomameSoussi/roastmypic.git
   cd roastmypic
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
pnpm build
pnpm start
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Alternative: Manus API Key
# MANUS_API_KEY=your_manus_api_key_here
```

**Note**: Never commit `.env.local` to version control. Use `.env.example` as a template.

## 🌐 API Documentation

### POST `/api/roast`

Generates a roast for an uploaded image.

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (File, required): The image file to roast
  - `style` (string, optional): Roast style (default: `clean_funny`)

**Response**:
```json
{
  "roast": "Your roast text here..."
}
```

**Error Response**:
```json
{
  "error": "Error message here"
}
```

**Supported Styles**:
- `moroccan_savage`: Darija, street-smart, sarcastic
- `clean_funny`: Family-friendly humor
- `dark_humor`: Mildly edgy but safe
- `flirty`: Playful and charming (PG-13)
- `corporate`: LinkedIn-style sarcasm
- `muslim_friendly`: Respectful and clean

## 🧪 Testing

### Manual Testing

1. Start the dev server: `pnpm dev`
2. Upload a test image
3. Try different roast styles
4. Verify roasts are generated correctly
5. Test error handling (invalid files, large files)

### Build Testing

```bash
pnpm build
```

Ensure the build completes without errors.

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add OPENAI_API_KEY
```

### Post-Deployment Checklist

- ✅ Production build works
- ✅ API route is functional
- ✅ Environment variables are set
- ✅ Images upload and process correctly
- ✅ All roast styles work
- ✅ Error handling works properly

## 🔒 Safety & Moderation

RoastMyPic includes built-in safety features:

- **Max 25 words per roast**
- **No hate speech, slurs, or NSFW content**
- **No mentions of race, religion, disabilities, or protected attributes**
- **Playful and safe humor only**
- **Content sanitization before returning results**

## 🛠 Development

### Adding New Roast Styles

1. Edit `lib/ai.ts` and add a new style modifier to `STYLE_MODIFIERS`
2. Edit `app/page.tsx` and add the style to `ROAST_STYLES` array

### Switching to Manus API

1. Update `lib/ai.ts` to use Manus API endpoint
2. Update `.env.local` with `MANUS_API_KEY`
3. Modify the fetch call in `generateRoast()` function

## 📜 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 🔗 Links

- **GitHub**: [https://github.com/HomameSoussi/roastmypic](https://github.com/HomameSoussi/roastmypic)
- **Live Demo**: (Deploy to get your URL)

---

Made with 🔥 by RoastMaster9000
