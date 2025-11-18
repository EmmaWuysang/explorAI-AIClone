# explorAI Design System & Architecture

## 🎨 Design Language

### Visual Philosophy
- **Minimalistic & Clean**: Claude-inspired interface with breathing room and intentional whitespace
- **Glassmorphism**: Subtle transparency and blur effects for modern depth
- **Smooth Animations**: Framer Motion powers all micro-interactions and transitions
- **Responsive**: Mobile-first design that scales beautifully across all devices

### Color System

#### CSS Variables (Light Mode)
```css
--color-bg-primary: 255, 255, 255
--color-bg-secondary: 250, 250, 250
--color-bg-tertiary: 245, 245, 245
--color-accent: 99, 102, 241 (Indigo)
--color-text-primary: 17, 24, 39
```

#### Dark Mode
Automatically adapts based on `prefers-color-scheme: dark`

### Typography
- System font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- Code blocks: SF Mono, Monaco, Cascadia Code, Roboto Mono
- Antialiasing & optimized text rendering

### Animation Principles
- **Fast**: 150ms for instant feedback
- **Base**: 200ms for standard transitions
- **Slow**: 300ms for emphasis
- **Spring**: cubic-bezier(0.34, 1.56, 0.64, 1) for playful bounces

---

## 🏗️ Architecture

### State Management (Zustand)

**Global Store** (`/lib/store.ts`):
- ✅ Conversation management with persistence
- ✅ Agent status tracking (thinking, using tools)
- ✅ Message history with timestamps
- ✅ LocalStorage persistence
- ✅ Optimized selectors

### Agentic Service Layer

**Location**: `/lib/services/`

**Available Tools**:

1. **Web Research** (`web-search.ts`)
   - `web_search`: Search the internet
   - `fetch_url`: Extract content from URLs
   - *Future*: DuckDuckGo, SerpAPI, Brave Search integration

2. **Data Processing** (`data-processing.ts`)
   - `summarize_text`: AI-powered summarization
   - `extract_data`: Regex/NLP extraction (emails, URLs, dates)
   - `analyze_data`: Statistical analysis

3. **Memory** (`memory.ts`)
   - `save_memory`: Persistent context storage
   - `recall_memory`: Retrieve saved information
   - `search_memory`: Keyword search across memories
   - *Storage*: LocalStorage with JSON serialization

**Tool Registry** (`services/index.ts`):
```typescript
const capabilities = [
  { id: 'web-research', tools: [...], enabled: true },
  { id: 'data-processing', tools: [...], enabled: true },
  { id: 'memory', tools: [...], enabled: true }
]
```

---

## 🎭 Component Architecture

### Core Components

#### 1. **WelcomeScreen** (`/components/WelcomeScreen.tsx`)
- Animated landing page with staggered text reveals
- Capability showcase with hover effects
- Floating gradient background animations
- One-time display (localStorage tracking)

#### 2. **Chatbox** (`/components/Chatbox.tsx`)
Features:
- ✅ Real-time streaming responses
- ✅ Animated message bubbles with entrance effects
- ✅ Glassmorphic design
- ✅ Copy-to-clipboard on hover
- ✅ Typing indicators with pulsing dots
- ✅ Auto-scroll with smooth behavior
- ✅ Integrated with Zustand store
- ✅ Conversation persistence

#### 3. **Navigation** (`/components/Navigation.tsx`)
- Sticky header with blur backdrop
- Animated active states
- Mobile-responsive with hamburger menu
- Icon-based navigation (Lucide React)

#### 4. **PersonaEditor** (`/components/PersonaEditor.tsx`)
- JSON-based persona configuration
- CRUD operations for AI personalities
- File-system backed storage

---

## 🔮 Future Capabilities (Architecture Ready)

### 1. RAG (Retrieval Augmented Generation)
```typescript
// Future implementation
const ragTool = {
  name: 'search_knowledge_base',
  execute: async ({ query, collection }) => {
    // Vector search in Pinecone/Weaviate
    // Return relevant context chunks
  }
}
```

### 2. Multi-Agent Orchestration
```typescript
// Future: Specialized agents
const agents = [
  { role: 'researcher', tools: ['web_search', 'summarize'] },
  { role: 'analyst', tools: ['analyze_data', 'extract_data'] },
  { role: 'writer', tools: ['save_memory', 'recall_memory'] }
]
```

### 3. External API Integrations
- Calendar management (Google Calendar API)
- Email drafting (Gmail API)
- Task management (Notion, Todoist)
- File operations (Google Drive, Dropbox)

### 4. Advanced Memory
- Vector embeddings for semantic search
- Conversation summarization
- Long-term context retention
- User preference learning

---

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.1.6 |
| Language | TypeScript | 5.7.2 |
| Styling | Tailwind CSS | 4.1.17 |
| Animations | Framer Motion | Latest |
| State | Zustand | Latest |
| Icons | Lucide React | Latest |
| AI Provider | OpenAI API | 6.9.1 |
| Runtime | React | 19.0.0 |

---

## 🎯 Key Design Patterns

### 1. Glassmorphic Utility Class
```css
.glassmorphic {
  background: rgba(var(--color-bg-elevated), 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--color-border), 0.5);
}
```

### 2. Text Gradient
```css
.text-gradient {
  background: linear-gradient(135deg, rgb(var(--color-accent)), rgb(168, 85, 247));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 3. Skeleton Loading
```css
.skeleton {
  background: linear-gradient(90deg, ...);
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

---

## 🧩 Extending the System

### Adding a New Tool

1. Create tool file in `/lib/services/`
2. Define tool interface:
```typescript
export const myTool: Tool = {
  name: 'my_tool',
  description: 'What it does',
  parameters: { /* schema */ },
  execute: async (params) => {
    // Implementation
    return { success: true, data: result }
  }
}
```

3. Register in `/lib/services/index.ts`:
```typescript
agentCapabilities.push({
  id: 'my-capability',
  tools: [myTool],
  enabled: true
})
```

### Adding a New Page

1. Create route in `/app/your-page/page.tsx`
2. Add navigation item in `/components/Navigation.tsx`
3. Use design system variables and components

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large**: > 1280px

All components use Tailwind's responsive prefixes (`md:`, `lg:`, etc.)

---

## ♿ Accessibility

- ✅ Keyboard navigation support
- ✅ Focus-visible states
- ✅ Reduced motion preferences respected
- ✅ Semantic HTML structure
- ✅ ARIA labels where appropriate
- ✅ Color contrast compliance

---

## 🎨 Animation Examples

### Message Entrance
```typescript
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.3 }}
/>
```

### Staggered Children
```typescript
{items.map((item, i) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: i * 0.1 }}
  />
))}
```

### Button Interactions
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

---

## 🔐 Environment Variables

Required in `.env`:
```
OPENAI_API_KEY=your_key_here
```

Future additions:
```
# Web Search
SERP_API_KEY=
BRAVE_SEARCH_API_KEY=

# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
```

---

## 📝 Notes

- All colors use RGB values for transparency control
- Animations respect `prefers-reduced-motion`
- LocalStorage used for persistence (upgrade to DB recommended)
- Conversation history preserved across sessions
- Persona system allows AI personality customization

---

**Last Updated**: 2025-01-17
**Version**: 2.0.0 - Complete Design Overhaul
