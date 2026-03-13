import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
});

const DesignAnalysisSchema = z.object({
  title: z.string().describe('Main title for the design, max 10 words'),
  subtitle: z.string().optional().describe('Subtitle or description, max 20 words'),
  cta: z.string().optional().describe('Call-to-action text if applicable'),
  mood: z.enum(['inspirational', 'informative', 'promotional', 'urgent', 'casual', 'professional']),
  suggestedCategory: z.enum(['quote', 'promo', 'announcement', 'tip', 'story']),
  backgroundPrompt: z.string().describe('Description for AI image generation for the background'),
  colors: z.object({
    primary: z.string().describe('Primary color hex code'),
    secondary: z.string().describe('Secondary color hex code'),
    text: z.string().describe('Text color hex code'),
  }),
});

type DesignAnalysis = z.infer<typeof DesignAnalysisSchema>;

export interface PlatformDimensions {
  width: number;
  height: number;
  name: string;
}

@Injectable()
export class DesignAIService {
  private readonly logger = new Logger(DesignAIService.name);

  private platformDimensions: Record<string, PlatformDimensions> = {
    instagram: { width: 1080, height: 1080, name: 'Instagram Post' },
    'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
    twitter: { width: 1600, height: 900, name: 'Twitter/X' },
    linkedin: { width: 1200, height: 627, name: 'LinkedIn' },
    facebook: { width: 1200, height: 630, name: 'Facebook' },
    tiktok: { width: 1080, height: 1920, name: 'TikTok' },
    youtube: { width: 1280, height: 720, name: 'YouTube Thumbnail' },
    universal: { width: 1080, height: 1080, name: 'Universal Square' },
  };

  /**
   * Analyzes post content and extracts design information.
   */
  async analyzePostForDesign(postContent: string, platform: string): Promise<DesignAnalysis> {
    try {
      const response = await openai.chat.completions.parse({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: `You are a social media design expert. Analyze the following post content and extract information needed to create an engaging visual design for ${platform}.

Your task is to:
1. Extract a compelling title (max 10 words) that captures the main message
2. Create a subtitle if the content warrants one (max 20 words)
3. Identify any call-to-action
4. Determine the mood/tone of the content
5. Suggest a design category (quote, promo, announcement, tip, or story)
6. Write a detailed prompt for generating a background image that complements the content
7. Suggest appropriate colors based on the mood and platform

For the background prompt:
- Make it vivid and descriptive
- Include lighting, atmosphere, and style details
- Avoid text in the image description
- Consider the platform's aesthetic
- Add "dark gradient overlay" if text will be placed on top`,
          },
          {
            role: 'user',
            content: postContent,
          },
        ],
        response_format: zodResponseFormat(DesignAnalysisSchema, 'designAnalysis'),
      });

      const parsed = response.choices[0].message.parsed;
      if (!parsed) {
        throw new Error('Failed to parse design analysis');
      }

      return parsed;
    } catch (error) {
      this.logger.error('Error analyzing post for design', error);
      // Return default values if AI fails
      return {
        title: this.extractTitle(postContent),
        subtitle: undefined,
        cta: undefined,
        mood: 'casual',
        suggestedCategory: 'quote',
        backgroundPrompt: 'Abstract gradient background with soft colors, modern and clean aesthetic',
        colors: {
          primary: '#6366f1',
          secondary: '#a855f7',
          text: '#ffffff',
        },
      };
    }
  }

  /**
   * Get platform dimensions.
   */
  getPlatformDimensions(platform: string): PlatformDimensions {
    return this.platformDimensions[platform] || this.platformDimensions.universal;
  }

  /**
   * Get all available platforms with their dimensions.
   */
  getAllPlatforms(): Array<{ id: string } & PlatformDimensions> {
    return Object.entries(this.platformDimensions).map(([id, dims]) => ({
      id,
      ...dims,
    }));
  }

  /**
   * Extract title from post content (fallback method).
   */
  private extractTitle(content: string): string {
    // Get first sentence or first 10 words
    const firstSentence = content.split(/[.!?]/)[0].trim();
    const words = firstSentence.split(/\s+/);

    if (words.length <= 10) {
      return firstSentence;
    }

    return words.slice(0, 10).join(' ') + '...';
  }

  /**
   * Generate multiple design variations for different platforms.
   */
  async generateMultiPlatformDesigns(
    postContent: string,
    platforms: string[]
  ): Promise<Array<{ platform: string; analysis: DesignAnalysis; dimensions: PlatformDimensions }>> {
    const analyses = await Promise.all(
      platforms.map(async (platform) => {
        const analysis = await this.analyzePostForDesign(postContent, platform);
        const dimensions = this.getPlatformDimensions(platform);
        return { platform, analysis, dimensions };
      })
    );

    return analyses;
  }

  /**
   * Suggest templates based on post analysis.
   */
  suggestTemplateCategory(analysis: DesignAnalysis): string[] {
    const suggestions: string[] = [analysis.suggestedCategory];

    // Add related categories based on mood
    switch (analysis.mood) {
      case 'inspirational':
        if (!suggestions.includes('quote')) suggestions.push('quote');
        break;
      case 'promotional':
        if (!suggestions.includes('promo')) suggestions.push('promo');
        break;
      case 'informative':
        if (!suggestions.includes('tip')) suggestions.push('tip');
        break;
      case 'urgent':
        if (!suggestions.includes('announcement')) suggestions.push('announcement');
        break;
    }

    return suggestions;
  }
}
