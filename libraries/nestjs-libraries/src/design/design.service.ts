import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { DesignRepository } from './design.repository';
import { TemplateService } from './template.service';
import { RenderService } from './render.service';
import { DesignAIService } from './design-ai.service';
import { MediaService } from '@postys/nestjs-libraries/database/prisma/media/media.service';
import { SubscriptionService } from '@postys/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import {
  GenerateDesignDto,
  GenerateFromTemplateDto,
} from '@postys/nestjs-libraries/dtos/design/design.dto';

@Injectable()
export class DesignService {
  private readonly logger = new Logger(DesignService.name);

  constructor(
    private _designRepository: DesignRepository,
    private _templateService: TemplateService,
    private _renderService: RenderService,
    private _designAIService: DesignAIService,
    private _mediaService: MediaService,
    private _subscriptionService: SubscriptionService
  ) {}

  /**
   * Generate a design automatically from post content using AI.
   */
  async generateDesign(dto: GenerateDesignDto, userId: string, org: Organization) {
    // Check credits
    const credits = await this._subscriptionService.checkCredits(org, 'ai_images');
    if (process.env.STRIPE_PUBLISHABLE_KEY && credits.credits <= 0) {
      return { error: 'No credits available', credits: 0 };
    }

    // Analyze post content with AI
    const analysis = await this._designAIService.analyzePostForDesign(
      dto.postContent,
      dto.platform
    );

    const dimensions = this._designAIService.getPlatformDimensions(dto.platform);

    // Generate background image if we have AI capabilities
    let backgroundUrl: string | undefined;
    try {
      const imageResult = await this._subscriptionService.useCredit(
        org,
        'ai_images',
        async () => {
          return this._mediaService.generateImage(analysis.backgroundPrompt, org, true);
        }
      );
      if (typeof imageResult === 'string' && imageResult.startsWith('http')) {
        backgroundUrl = imageResult;
      }
    } catch (error) {
      this.logger.warn('Failed to generate background image, using solid color', error);
    }

    // Render the design
    const renderedUrl = await this._renderService.renderDesignWithBackground({
      width: dimensions.width,
      height: dimensions.height,
      backgroundUrl,
      backgroundColor: analysis.colors.primary,
      overlayOpacity: backgroundUrl ? 0.5 : 0,
      title: analysis.title,
      subtitle: analysis.subtitle,
      cta: analysis.cta,
      titleColor: analysis.colors.text,
      textColor: analysis.colors.text,
      layout: 'center',
    });

    // Save the design
    const design = await this._designRepository.create({
      name: analysis.title.substring(0, 50),
      variables: {
        title: analysis.title,
        subtitle: analysis.subtitle || '',
        cta: analysis.cta || '',
        backgroundPrompt: analysis.backgroundPrompt,
        mood: analysis.mood,
      },
      renderedUrl,
      width: dimensions.width,
      height: dimensions.height,
      userId,
      organizationId: org.id,
    });

    return {
      design,
      analysis,
      dimensions,
    };
  }

  /**
   * Generate a design from a specific template.
   */
  async generateFromTemplate(
    dto: GenerateFromTemplateDto,
    userId: string,
    org: Organization
  ) {
    const template = await this._templateService.getTemplateById(dto.templateId);

    // Render the template with provided variables
    const renderedUrl = await this._renderService.renderTemplate({
      width: template.width,
      height: template.height,
      html: template.html,
      css: template.css,
      variables: dto.variables,
    });

    // Save the design
    const design = await this._designRepository.create({
      name: dto.name || template.name,
      templateId: template.id,
      variables: dto.variables,
      renderedUrl,
      width: template.width,
      height: template.height,
      userId,
      organizationId: org.id,
    });

    return design;
  }

  /**
   * Generate designs for multiple platforms at once.
   */
  async generateMultiPlatformDesigns(
    postContent: string,
    platforms: string[],
    userId: string,
    org: Organization
  ) {
    const results = await Promise.all(
      platforms.map(async (platform) => {
        try {
          const result = await this.generateDesign(
            { postContent, platform },
            userId,
            org
          );
          return { platform, success: true, ...result };
        } catch (error) {
          this.logger.error(`Failed to generate design for ${platform}`, error);
          return { platform, success: false, error: (error as Error).message };
        }
      })
    );

    return results;
  }

  /**
   * Get a design by ID.
   */
  async getDesignById(id: string, organizationId: string) {
    const design = await this._designRepository.findById(id);
    if (!design || design.organizationId !== organizationId) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return design;
  }

  /**
   * List designs for an organization.
   */
  async listDesigns(organizationId: string, page: number = 1) {
    return this._designRepository.findByOrganization(organizationId, { page });
  }

  /**
   * Delete a design.
   */
  async deleteDesign(id: string, organizationId: string) {
    const result = await this._designRepository.delete(id, organizationId);
    if (result.count === 0) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return { success: true };
  }

  /**
   * Get available platforms with their dimensions.
   */
  getPlatforms() {
    return this._designAIService.getAllPlatforms();
  }

  /**
   * Re-render an existing design with new variables.
   */
  async updateDesignVariables(
    id: string,
    variables: Record<string, string>,
    organizationId: string
  ) {
    const design = await this.getDesignById(id, organizationId);

    if (!design.template) {
      throw new Error('Design does not have a template, cannot update variables');
    }

    // Render with new variables
    const renderedUrl = await this._renderService.renderTemplate({
      width: design.width,
      height: design.height,
      html: design.template.html,
      css: design.template.css,
      variables,
    });

    // Update the design
    await this._designRepository.updateRenderedUrl(id, renderedUrl);

    return {
      ...design,
      variables,
      renderedUrl,
    };
  }
}
