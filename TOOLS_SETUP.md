# Stark Industries AI - Tools Setup Guide

## Overview
This guide covers setup for all agentic tools and services.

---

## 🔍 Web Search

### Recommended: Tavily (Best for AI)
1. Sign up at https://tavily.com
2. Get API key from dashboard
3. Add to `.env`:
```env
TAVILY_API_KEY=tvly-xxxxx
```

**Pricing**: Free tier (1,000 searches/month), then $0.006/search

### Alternative: Serper (Google Results)
1. Sign up at https://serper.dev
2. Add to `.env`:
```env
SERPER_API_KEY=xxxxx
```

**Pricing**: Free tier (2,500 searches/month), then $5/1000 searches

### Alternative: Brave Search
1. Sign up at https://brave.com/search/api/
2. Add to `.env`:
```env
BRAVE_API_KEY=xxxxx
```

---

## 👁️ Computer Vision

### Option 1: GPT-4 Vision (Recommended)
Already configured if you have `OPENAI_API_KEY` set.

**Pricing**: $0.01/image (low detail), $0.03/image (high detail)

### Option 2: Claude Vision
1. Get API key from https://console.anthropic.com
2. Add to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Pricing**: ~$0.01-0.03/image depending on size

---

## 📅 Calendar Integration (Google Calendar)

### Setup OAuth 2.0

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Download credentials

7. Get refresh token (run this Node script):

```javascript
// scripts/get-google-token.js
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');

const oauth2Client = new OAuth2Client(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000'
);

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Refresh Token:', tokens.refresh_token);
});
```

8. Add to `.env`:
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REFRESH_TOKEN=xxxxx
```

---

## 🎙️ Low-Latency Voice Conversation

### Option 1: OpenAI Realtime API (Recommended)
Already configured if you have `OPENAI_API_KEY`.

**Requirements**:
- WebSocket support on frontend
- Audio streaming setup

**Latency**: ~300ms
**Pricing**: $0.06/min input, $0.24/min output

### Option 2: ElevenLabs Conversational AI
1. Sign up at https://elevenlabs.io
2. Get API key
3. Add to `.env`:
```env
ELEVENLABS_API_KEY=xxxxx
```

**Latency**: ~250-400ms
**Pricing**: Pay-per-character + conversation minutes

### Option 3: Deepgram Voice Agent
1. Sign up at https://deepgram.com
2. Get API key
3. Add to `.env`:
```env
DEEPGRAM_API_KEY=xxxxx
```

**Latency**: ~200-400ms
**Pricing**: $0.0043/min STT + TTS pricing

### Option 4: Groq + Deepgram + Cartesia Stack (DIY)
```env
GROQ_API_KEY=gsk_xxxxx          # https://console.groq.com
DEEPGRAM_API_KEY=xxxxx          # For STT
CARTESIA_API_KEY=xxxxx          # https://cartesia.ai for TTS
```

**Latency**: ~300-500ms
**Pricing**: Most cost-effective at scale

---

## 🧠 Letta (MemGPT) - Long-term Memory

### Option 1: Letta Cloud (Easiest)
```bash
pip install letta
letta configure
```

Add to `.env`:
```env
LETTA_API_KEY=xxxxx
```

**Pricing**: $20/month (Starter), $50/month (Pro)

### Option 2: Self-Hosted
```bash
# Install
pip install letta

# Start server
letta server

# Add to .env
LETTA_BASE_URL=http://localhost:8283
LETTA_TOKEN=xxxxx
```

**Requirements**:
- PostgreSQL with pgvector extension
- Or Docker setup

---

## 📊 Complete `.env` Template

```env
# Core LLM
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Optional

# Web Search (choose one)
TAVILY_API_KEY=tvly-xxxxx
# SERPER_API_KEY=xxxxx
# BRAVE_API_KEY=xxxxx

# Google Calendar (optional)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REFRESH_TOKEN=xxxxx

# Voice Conversation (choose one)
# ELEVENLABS_API_KEY=xxxxx
# DEEPGRAM_API_KEY=xxxxx
# GROQ_API_KEY=gsk_xxxxx
# CARTESIA_API_KEY=xxxxx

# Long-term Memory (optional)
# LETTA_API_KEY=xxxxx
# LETTA_BASE_URL=https://api.letta.com

# Screenshot tool (optional)
# SCREENSHOTONE_API_KEY=xxxxx
```

---

## 🚀 Quick Start (Minimum Setup)

For basic functionality, you only need:

```env
OPENAI_API_KEY=sk-xxxxx
TAVILY_API_KEY=tvly-xxxxx  # For web search
```

This gives you:
- ✅ Chat with GPT-4
- ✅ Web search capability
- ✅ Computer vision (GPT-4V)
- ✅ URL fetching (Jina Reader - free)
- ✅ Basic memory (localStorage)

---

## 📖 Tool Usage in Chat

Once configured, tools are automatically available:

**Web Search**:
> "What's the latest news on quantum computing?"

**Vision**:
> "Analyze this image: https://example.com/diagram.png"

**Calendar** (if configured):
> "What meetings do I have tomorrow?"

**URL Fetch**:
> "Summarize this article: https://example.com/article"

---

## 🔧 Testing Tools

Test individual tools:

```bash
# Test web search
curl -X POST http://localhost:3000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "web_search", "params": {"query": "test"}}'

# Test vision
curl -X POST http://localhost:3000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "analyze_image", "params": {"imageUrl": "https://example.com/image.jpg", "prompt": "describe this"}}'
```

---

## 💰 Cost Optimization Tips

1. **Use Tavily's free tier** for development (1,000 searches/month)
2. **Start with GPT-4o-mini** for cheaper responses
3. **Enable caching** for repeated queries
4. **Use Groq** for ultra-fast, cheap inference (free tier available)
5. **Self-host Letta** if you need >10k messages/month

---

## 🐛 Troubleshooting

### Web search not working
- Check API key is correct
- Verify you haven't hit rate limits
- Check API provider status page

### Vision analysis fails
- Ensure image URL is publicly accessible
- Check image format (JPG, PNG, WebP supported)
- Verify API key has vision access

### Calendar errors
- Refresh token may have expired - re-run OAuth flow
- Check Google Cloud Console for API quotas
- Ensure Calendar API is enabled

---

## 📚 Additional Resources

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Tavily API Docs](https://docs.tavily.com)
- [Letta Documentation](https://docs.letta.com)
- [Google Calendar API Guide](https://developers.google.com/calendar)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai)
