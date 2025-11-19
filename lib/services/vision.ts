import { Tool, ToolResult } from './types';

/**
 * Computer Vision Service
 * Supports: GPT-4 Vision, Claude 3 Vision, Gemini Vision
 *
 * Setup:
 * - Uses existing OPENAI_API_KEY from .env for GPT-4V
 * - Or add ANTHROPIC_API_KEY for Claude Vision
 * - Or GOOGLE_API_KEY for Gemini Vision
 */

export const analyzeImageTool: Tool = {
  name: 'analyze_image',
  description: 'Analyze images using AI vision models. Can identify objects, read text (OCR), describe scenes, answer questions about images, and more.',
  parameters: {
    imageUrl: {
      type: 'string',
      description: 'URL of the image to analyze, or base64 data URL',
      required: true,
    },
    prompt: {
      type: 'string',
      description: 'What you want to know about the image (e.g., "What objects are in this image?", "Read the text", "Describe this scene")',
      required: true,
    },
    detailLevel: {
      type: 'string',
      description: 'Detail level: "low" for quick analysis, "high" for detailed',
      required: false,
      default: 'auto',
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { imageUrl, prompt, detailLevel = 'auto' } = params;

    try {
      // Try GPT-4 Vision first (most common)
      if (process.env.OPENAI_API_KEY) {
        return await analyzeWithGPT4Vision(
          imageUrl as string,
          prompt as string,
          detailLevel as string
        );
      }

      // Fallback to Claude Vision
      if (process.env.ANTHROPIC_API_KEY) {
        return await analyzeWithClaudeVision(
          imageUrl as string,
          prompt as string
        );
      }

      return {
        success: false,
        error: 'No vision API configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Vision analysis failed',
      };
    }
  },
};

// GPT-4 Vision Analysis
async function analyzeWithGPT4Vision(
  imageUrl: string,
  prompt: string,
  detailLevel: string
): Promise<ToolResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o', // Latest vision model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: detailLevel,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GPT-4V API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    data: {
      analysis: data.choices[0].message.content,
      model: 'gpt-4o',
      provider: 'OpenAI',
    },
    metadata: {
      timestamp: Date.now(),
      usage: data.usage,
    },
  };
}

// Claude Vision Analysis
async function analyzeWithClaudeVision(
  imageUrl: string,
  prompt: string
): Promise<ToolResult> {
  // Fetch image and convert to base64 if needed
  let imageData = imageUrl;
  let mediaType = 'image/jpeg';

  if (imageUrl.startsWith('http')) {
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    imageData = Buffer.from(imageBuffer).toString('base64');
    mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
  } else if (imageUrl.startsWith('data:')) {
    // Extract base64 from data URL
    const match = imageUrl.match(/data:([^;]+);base64,(.+)/);
    if (match) {
      mediaType = match[1];
      imageData = match[2];
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude Vision API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    data: {
      analysis: data.content[0].text,
      model: 'claude-3-5-sonnet',
      provider: 'Anthropic',
    },
    metadata: {
      timestamp: Date.now(),
      usage: data.usage,
    },
  };
}

export const screenshotAndAnalyzeTool: Tool = {
  name: 'screenshot_and_analyze',
  description: 'Take a screenshot of a webpage and analyze it with AI vision. Useful for understanding UI/UX, extracting data from visual content, or analyzing designs.',
  parameters: {
    url: {
      type: 'string',
      description: 'URL of the webpage to screenshot',
      required: true,
    },
    prompt: {
      type: 'string',
      description: 'What to analyze in the screenshot',
      required: true,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { url, prompt } = params;

    try {
      // Use screenshotone.com API (has free tier) or similar
      const screenshotUrl = `https://api.screenshotone.com/take?access_key=${process.env.SCREENSHOTONE_API_KEY}&url=${encodeURIComponent(url as string)}&viewport_width=1280&viewport_height=720&format=jpg`;

      // Now analyze the screenshot
      return await analyzeImageTool.execute({
        imageUrl: screenshotUrl,
        prompt: prompt as string,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Screenshot and analysis failed',
      };
    }
  },
};
