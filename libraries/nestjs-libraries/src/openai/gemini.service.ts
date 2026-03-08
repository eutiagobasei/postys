import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  async generateImage(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY is not configured');
    }

    // Using Gemini's Imagen 3 model for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            safetyFilterLevel: 'block_few',
            personGeneration: 'allow_adult',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini image generation error:', error);

      // Fallback to Gemini 2.0 Flash for image generation if Imagen fails
      return this.generateImageWithGemini2(prompt);
    }

    const data = await response.json();

    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      return data.predictions[0].bytesBase64Encoded;
    }

    throw new Error('Failed to generate image with Gemini Imagen');
  }

  private async generateImageWithGemini2(prompt: string): Promise<string> {
    // Using Gemini 2.0 Flash experimental with image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an image: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini 2.0 image generation failed: ${error}`);
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error('No image generated in Gemini response');
  }

  async generatePromptForPicture(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an assistant that takes a description and generates a detailed prompt for image generation. Make it very descriptive, include details about lighting, style, composition, and mood. If it's realistic, describe the camera settings.

Description: ${prompt}

Generate only the image prompt, nothing else.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate prompt with Gemini');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
  }

  isConfigured(): boolean {
    return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
  }
}
