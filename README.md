# 🎓 EXPLORAI - AICLONE
> ˙𐃷˙ *  Your personalized AI clone. Create any persona! wohooooo!

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your OpenAI API key to `.env`:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## 📁 Project Structure

```
explorAI-AIClone/
├── app/                    # Next.js App Router
│   ├── api/              # API routes
│   │   └── chat/         # Chat API endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   └── Chatbox.tsx       # Chat interface component
├── lib/                  # Utility functions
├── LLM-Notes/           # LLM notetaking framework
└── public/              # Static assets
```

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_api_key_here
```

**Note:** The `.env` file is already included in `.gitignore` and will not be committed to version control.

---

## 📝 Development Notes

- All markdown documentation is stored in `LLM-Notes/`
- See `LLM-Notes/FRAMEWORK-GUIDE.md` for the notetaking framework
- See `LLM-Notes/goals/project-game-plan.md` for the project roadmap

---

## 🎯 Project Goals

Create a scalable and dynamic AI-powered chatbot application with:
- Access to external APIs (Google Mail, Google Calendar, etc.)
- Real-time note and goal management
- Task list organization
- Dynamic archiving system

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
