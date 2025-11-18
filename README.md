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

```bash
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
│   │   ├── chat/         # Chat API endpoint (OpenAI streaming)
│   │   └── personas/     # Persona CRUD endpoints
│   ├── personas/         # Persona management page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (Chat interface)
├── components/           # React components
│   ├── Chatbox.tsx       # Chat interface with streaming
│   ├── Navigation.tsx    # Navigation component
│   └── PersonaEditor.tsx # Persona editor component
├── lib/                  # Utility functions
│   ├── ai-client.ts      # OpenAI API client
│   └── persona-manager.ts # Persona file management
├── personas/             # Persona JSON files
│   └── default.json      # Default persona
├── LLM-Notes/           # LLM notetaking framework
└── public/              # Static assets
```

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI Provider:** OpenAI (gpt-4o-mini)
- **Runtime:** Node.js

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variable:

```env

```

**Note:** The `.env` file is already included in `.gitignore` and will not be committed to version control.

---

## 📝 Development Notes

- All markdown documentation is stored in `LLM-Notes/`
- See `LLM-Notes/FRAMEWORK-GUIDE.md` for the notetaking framework
- See `LLM-Notes/goals/project-game-plan.md` for the project roadmap

---



---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
