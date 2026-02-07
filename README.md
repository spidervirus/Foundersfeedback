# Founder Clarity Platform

A platform that gives founders AI-powered strategic analysis and structured peer reviews to get actionable feedback on positioning, ICP clarity, differentiation, and pricing logic.

## 🚀 Features

### Layer 1: AI Strategic Analysis (Instant)
- **Positioning Clarity**: Is the problem clear? Must-have vs nice-to-have?
- **ICP Clarity**: Is the target audience too broad?
- **Differentiation**: Does this sound like 50 other tools?
- **Pricing Logic**: Does pricing match the target customer?

### Layer 2: Peer Founder Reviews (Coming Soon)
- Get matched with 2-3 founders at your stage
- Structured review questions for actionable feedback
- Real-world insights from people who understand your challenges

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with "Friendly & Flow" design system
- **AI**: Google Gemini (gemini-1.5-flash)
- **Database**: Supabase (PostgreSQL) - ready for V2
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aihuman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google Gemini Configuration (REQUIRED for AI analysis)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Supabase Configuration (Optional for MVP)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Get your Google Gemini API key**
   - Go to [aistudio.google.com](https://aistudio.google.com/)
   - Create a free account or sign in
   - Create a new API key
   - Copy and paste it into your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

1. **Visit the landing page** - Understand the value proposition
2. **Click "Get Your Feedback"** - Start the submission process
3. **Fill out the form**:
   - Step 1: Enter your landing page URL
   - Step 2: Describe your target customer and value prop
   - Step 3: Select your stage and product type
4. **Get instant AI analysis** - Receive scores and feedback on 4 key dimensions
5. **Review your results** - See detailed suggestions for improvement

## 📁 Project Structure

```
aihuman/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── submit/
│   │   └── page.tsx            # Submission form
│   ├── analysis/[id]/
│   │   └── page.tsx            # Analysis results
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        # API endpoint for analysis
│   └── globals.css             # Design system
├── components/
│   └── ui/                     # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Badge.tsx
├── lib/
│   ├── ai/
│   │   └── analyzer.ts         # Google Gemini AI analysis engine
│   └── supabase/
│       └── client.ts           # Supabase client (for V2)
└── public/                     # Static assets
```

## 🎨 Design System

The platform features a "Friendly & Flow" light theme with:
- **Clean white backgrounds** for a trustworthy feel
- **Rounded pill-shaped** buttons and containers
- **Vibrant Royal Blue** primary actions
- **Soft card shadows** for depth without clutter
- **Responsive design** for all devices

## 🔧 MVP vs Production

### Current MVP Features
- ✅ AI strategic analysis with Google Gemini
- ✅ Web scraping for landing page content
- ✅ Beautiful, responsive "Friendly" UI
- ✅ Multi-step submission form
- ✅ Detailed analysis results
- ✅ localStorage for data persistence

### Coming in V2
- 🔄 Supabase database integration
- 🔄 User authentication
- 🔄 Peer matching algorithm
- 🔄 Structured peer review interface
- 🔄 Review aggregation
- 🔄 Payment integration (Stripe)
- 🔄 Email notifications
- 🔄 Dashboard with history

## 🐛 Troubleshooting

### "Failed to analyze product"
- Check that your GEMINI_API_KEY is correctly set in `.env.local`
- Verify the landing page URL is accessible
- Check your internet connection

### Page won't load
- Make sure the dev server is running (`npm run dev`)
- Check for any console errors in the browser
- Clear localStorage if you see stale data

### Styling looks broken
- Run `npm install` to ensure all dependencies are installed
- Check that Tailwind CSS is properly configured

## 📝 License

MIT

## 🤝 Contributing

This is a founder-focused project. Contributions welcome!

---

**Built for founders, by founders.** 🚀
