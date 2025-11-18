# Multi-Provider AI System

**Created:** 2025-11-18T01:27:52Z  
**Status:** Completed

## Overview

The application now supports hot-swapping between multiple frontier AI APIs, allowing users to seamlessly switch between different AI providers and models in real-time.

## Supported Providers

### 1. OpenAI
- **Models:** GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **API Key:** `OPENAI_API_KEY`
- **Base URL:** `https://api.openai.com/v1`

### 2. Anthropic (Claude)
- **Models:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **API Key:** `ANTHROPIC_API_KEY`
- **Base URL:** `https://api.anthropic.com/v1`

### 3. Google (Gemini)
- **Models:** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash-Lite
- **API Key:** `GOOGLE_API_KEY`
- **Base URL:** `https://generativelanguage.googleapis.com/v1beta`

### 4. Mistral AI
- **Models:** Mistral Large, Mistral Medium
- **API Key:** `MISTRAL_API_KEY`
- **Base URL:** `https://api.mistral.ai/v1`

### 5. Cohere
- **Models:** Command R+, Command R
- **API Key:** `COHERE_API_KEY`
- **Base URL:** `https://api.cohere.com/v1`

## Environment Configuration

### .env File Structure

```env
# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key_here

# Google
GOOGLE_API_KEY=your_google_key_here

# Mistral
MISTRAL_API_KEY=your_mistral_key_here

# Cohere
COHERE_API_KEY=your_cohere_key_here
```

**Note:** Only add API keys for providers you want to use. The application will automatically detect which providers are configured and only show their models.

## Features

### 1. Hot-Swappable Models
- Switch between AI models in real-time without page reload
- Model selector shows only configured providers
- Visual indicators for each provider (color-coded badges)
- Context window information displayed for each model

### 2. Unified Streaming Interface
- All providers support real-time streaming
- Consistent user experience across all AI providers
- Automatic error handling for API failures
- Clear error messages when providers aren't configured

### 3. Provider Status Detection
- Automatic detection of configured providers
- Visual feedback for unconfigured providers
- Helpful error messages guiding users to add API keys

## Architecture

### Core Components

#### `lib/ai-providers.ts`
- Defines all available models and providers
- Manages provider configuration status
- Provides utility functions for provider management

#### `lib/ai-client.ts`
- Unified client for all AI providers
- Handles streaming for each provider's API format
- Abstracts provider-specific differences

#### `components/ModelSelector.tsx`
- Dropdown UI for model selection
- Provider filtering
- Visual status indicators
- Real-time model switching

### API Endpoints

#### `/api/models` (GET)
Returns:
- All available models
- Configured models (only those with API keys)
- Provider status for each provider

#### `/api/chat` (POST)
Accepts:
- `message`: User message
- `personaId`: Persona to use (optional)
- `modelId`: AI model to use (optional, defaults to persona model or gpt-4o)

## Usage

### Setting Up Providers

1. Copy `.env.example` to `.env`
2. Add API keys for desired providers:
   ```env
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...
   ```
3. Restart the development server
4. Models for configured providers will appear in the selector

### Using the Model Selector

1. Click the model selector dropdown in the chat interface
2. Filter by provider using the provider tabs
3. Select a model from the list
4. The selected model will be used for the next message
5. Switch models at any time - changes take effect immediately

### Model Information

Each model displays:
- Provider name (color-coded badge)
- Model name
- Context window size (in tokens)
- Configuration status

## Implementation Details

### Provider-Specific Streaming

Each provider has its own streaming implementation:

- **OpenAI/Anthropic/Mistral:** Server-Sent Events (SSE) format
- **Google:** JSON streaming format
- **Cohere:** Custom streaming format

All are normalized to a unified `StreamChunk` interface.

### Error Handling

- Missing API keys: Clear error messages with instructions
- API failures: Provider-specific error messages
- Invalid models: Validation before API calls
- Network errors: Graceful degradation with user feedback

## Model Capabilities

### Context Windows
- **Gemini 2.5 Pro/Flash/Flash-Lite:** 1,048,576 tokens (largest)
- **Claude 3.5 Sonnet:** 200,000 tokens
- **GPT-4o:** 128,000 tokens
- **Command R+:** 128,000 tokens
- **Mistral Large:** 32,000 tokens

### Streaming Support
All models support real-time streaming for immediate user feedback.

## Future Enhancements

- [ ] Model performance comparison
- [ ] Cost tracking per provider
- [ ] Response time metrics
- [ ] Model recommendation based on use case
- [ ] Batch API key testing
- [ ] Provider health status monitoring
- [ ] Fallback to alternative providers on failure

