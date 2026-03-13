import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TemplateRepository } from './template.repository';
import { CreateTemplateDto, ListTemplatesQueryDto } from '@postys/nestjs-libraries/dtos/design/design.dto';
import { RenderService } from './render.service';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private _templateRepository: TemplateRepository,
    private _renderService: RenderService
  ) {}

  async createTemplate(data: CreateTemplateDto, organizationId?: string) {
    const template = await this._templateRepository.create(data, organizationId);

    // Generate thumbnail for the template
    try {
      const thumbnailUrl = await this.generateTemplateThumbnail(template.id);
      if (thumbnailUrl) {
        await this._templateRepository.updateThumbnail(template.id, thumbnailUrl);
        return { ...template, thumbnail: thumbnailUrl };
      }
    } catch (error) {
      this.logger.warn('Failed to generate template thumbnail', error);
    }

    return template;
  }

  async getTemplateById(id: string) {
    const template = await this._templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async listTemplates(query: ListTemplatesQueryDto, organizationId?: string) {
    return this._templateRepository.findAll({
      category: query.category,
      platform: query.platform,
      organizationId,
      page: query.page || 1,
    });
  }

  async getTemplatesByPlatform(platform: string, organizationId?: string) {
    return this._templateRepository.findByPlatform(platform, organizationId);
  }

  async deleteTemplate(id: string, organizationId: string) {
    const result = await this._templateRepository.delete(id, organizationId);
    if (result.count === 0) {
      throw new NotFoundException(`Template with ID ${id} not found or not owned by organization`);
    }
    return { success: true };
  }

  /**
   * Generate a thumbnail for a template using default variable values.
   */
  private async generateTemplateThumbnail(templateId: string): Promise<string | null> {
    const template = await this._templateRepository.findById(templateId);
    if (!template) return null;

    // Create default variables from template definition
    const defaultVariables: Record<string, string> = {};
    const variables = template.variables as Array<{ name: string; default?: string; type: string }>;

    for (const variable of variables) {
      defaultVariables[variable.name] = variable.default || this.getPlaceholderValue(variable.name, variable.type);
    }

    // Render at reduced size for thumbnail
    const thumbnailWidth = Math.min(template.width, 400);
    const thumbnailHeight = Math.round((thumbnailWidth / template.width) * template.height);

    try {
      return await this._renderService.renderTemplate({
        width: thumbnailWidth,
        height: thumbnailHeight,
        html: template.html,
        css: template.css,
        variables: defaultVariables,
      });
    } catch (error) {
      this.logger.error('Failed to render template thumbnail', error);
      return null;
    }
  }

  /**
   * Get placeholder value for a variable based on its type.
   */
  private getPlaceholderValue(name: string, type: string): string {
    switch (type) {
      case 'image':
        return 'https://via.placeholder.com/400';
      case 'color':
        return '#6366f1';
      case 'text':
      default:
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
    }
  }

  /**
   * Seed initial templates (called during setup).
   */
  async seedInitialTemplates() {
    const existingCount = await this._templateRepository.findAll({ page: 1, limit: 1 });
    if (existingCount.total > 0) {
      this.logger.log('Templates already seeded, skipping');
      return;
    }

    const templates = this.getInitialTemplates();
    for (const template of templates) {
      try {
        await this.createTemplate(template);
        this.logger.log(`Created template: ${template.name}`);
      } catch (error) {
        this.logger.error(`Failed to create template: ${template.name}`, error);
      }
    }
  }

  private getInitialTemplates(): CreateTemplateDto[] {
    return [
      // Instagram Post - Quote
      {
        name: 'Inspirational Quote',
        description: 'Clean quote template with gradient background',
        category: 'quote',
        platform: 'instagram',
        width: 1080,
        height: 1080,
        variables: [
          { name: 'title', type: 'text', default: 'Your Quote Here', label: 'Quote' },
          { name: 'author', type: 'text', default: '— Author', label: 'Author' },
          { name: 'backgroundColor', type: 'color', default: '#667eea', label: 'Background' },
        ],
        html: `<div class="container">
          <div class="quote">{{title}}</div>
          <div class="author">{{author}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, {{backgroundColor}}, #764ba2);
          padding: 80px;
        }
        .quote {
          font-size: 48px;
          font-weight: bold;
          color: white;
          text-align: center;
          line-height: 1.4;
        }
        .author {
          font-size: 24px;
          color: rgba(255,255,255,0.8);
          margin-top: 40px;
        }`,
        isPublic: true,
      },

      // Instagram Story - Tip
      {
        name: 'Quick Tip Story',
        description: 'Story format for sharing tips',
        category: 'tip',
        platform: 'instagram',
        width: 1080,
        height: 1920,
        variables: [
          { name: 'tipNumber', type: 'text', default: 'TIP #1', label: 'Tip Label' },
          { name: 'title', type: 'text', default: 'Your Tip Here', label: 'Tip Title' },
          { name: 'description', type: 'text', default: 'Description of the tip goes here', label: 'Description' },
        ],
        html: `<div class="container">
          <div class="tip-badge">{{tipNumber}}</div>
          <div class="title">{{title}}</div>
          <div class="description">{{description}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          padding: 60px;
        }
        .tip-badge {
          font-size: 24px;
          font-weight: bold;
          color: #f472b6;
          letter-spacing: 4px;
        }
        .title {
          font-size: 64px;
          font-weight: bold;
          color: white;
          text-align: center;
          margin-top: 40px;
          line-height: 1.2;
        }
        .description {
          font-size: 32px;
          color: rgba(255,255,255,0.7);
          text-align: center;
          margin-top: 40px;
          line-height: 1.5;
        }`,
        isPublic: true,
      },

      // Twitter - Announcement
      {
        name: 'Announcement Banner',
        description: 'Bold announcement for Twitter',
        category: 'announcement',
        platform: 'twitter',
        width: 1600,
        height: 900,
        variables: [
          { name: 'label', type: 'text', default: 'NEW', label: 'Label' },
          { name: 'title', type: 'text', default: 'Announcing Something Big', label: 'Title' },
          { name: 'subtitle', type: 'text', default: 'Learn more about this exciting update', label: 'Subtitle' },
        ],
        html: `<div class="container">
          <div class="label">{{label}}</div>
          <div class="title">{{title}}</div>
          <div class="subtitle">{{subtitle}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
          padding: 60px;
        }
        .label {
          font-size: 20px;
          font-weight: bold;
          color: #22c55e;
          background: rgba(34,197,94,0.2);
          padding: 8px 24px;
          border-radius: 20px;
          letter-spacing: 2px;
        }
        .title {
          font-size: 72px;
          font-weight: bold;
          color: white;
          text-align: center;
          margin-top: 30px;
          line-height: 1.1;
        }
        .subtitle {
          font-size: 28px;
          color: rgba(255,255,255,0.6);
          text-align: center;
          margin-top: 20px;
        }`,
        isPublic: true,
      },

      // LinkedIn - Professional
      {
        name: 'Professional Insight',
        description: 'Clean professional template for LinkedIn',
        category: 'tip',
        platform: 'linkedin',
        width: 1200,
        height: 627,
        variables: [
          { name: 'title', type: 'text', default: 'Professional Insight', label: 'Title' },
          { name: 'subtitle', type: 'text', default: 'Key takeaway for your audience', label: 'Subtitle' },
          { name: 'accentColor', type: 'color', default: '#0077b5', label: 'Accent Color' },
        ],
        html: `<div class="container">
          <div class="accent-bar"></div>
          <div class="content">
            <div class="title">{{title}}</div>
            <div class="subtitle">{{subtitle}}</div>
          </div>
        </div>`,
        css: `.container {
          display: flex;
          height: 100%;
          background: #ffffff;
        }
        .accent-bar {
          width: 8px;
          background: {{accentColor}};
        }
        .content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          flex: 1;
        }
        .title {
          font-size: 48px;
          font-weight: bold;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .subtitle {
          font-size: 24px;
          color: #666666;
          margin-top: 20px;
          line-height: 1.5;
        }`,
        isPublic: true,
      },

      // Facebook - Promo
      {
        name: 'Promotional Offer',
        description: 'Eye-catching promotional template',
        category: 'promo',
        platform: 'facebook',
        width: 1200,
        height: 630,
        variables: [
          { name: 'discount', type: 'text', default: '50% OFF', label: 'Discount' },
          { name: 'title', type: 'text', default: 'Limited Time Offer', label: 'Title' },
          { name: 'cta', type: 'text', default: 'Shop Now', label: 'CTA' },
        ],
        html: `<div class="container">
          <div class="discount">{{discount}}</div>
          <div class="title">{{title}}</div>
          <div class="cta">{{cta}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
          padding: 60px;
        }
        .discount {
          font-size: 80px;
          font-weight: bold;
          color: white;
        }
        .title {
          font-size: 36px;
          color: rgba(255,255,255,0.9);
          text-align: center;
          margin-top: 20px;
        }
        .cta {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
          background: white;
          padding: 16px 48px;
          border-radius: 30px;
          margin-top: 40px;
        }`,
        isPublic: true,
      },

      // Universal - Minimalist Quote
      {
        name: 'Minimalist Quote',
        description: 'Simple black and white quote design',
        category: 'quote',
        platform: 'universal',
        width: 1080,
        height: 1080,
        variables: [
          { name: 'quote', type: 'text', default: 'Less is more.', label: 'Quote' },
          { name: 'author', type: 'text', default: '— Ludwig Mies van der Rohe', label: 'Author' },
        ],
        html: `<div class="container">
          <div class="quote">{{quote}}</div>
          <div class="author">{{author}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #000000;
          padding: 100px;
        }
        .quote {
          font-size: 56px;
          font-weight: 300;
          color: white;
          text-align: center;
          line-height: 1.4;
          font-style: italic;
        }
        .author {
          font-size: 20px;
          color: rgba(255,255,255,0.5);
          margin-top: 60px;
          letter-spacing: 2px;
        }`,
        isPublic: true,
      },

      // YouTube Thumbnail
      {
        name: 'YouTube Thumbnail',
        description: 'Bold thumbnail for YouTube videos',
        category: 'announcement',
        platform: 'youtube',
        width: 1280,
        height: 720,
        variables: [
          { name: 'title', type: 'text', default: 'WATCH THIS', label: 'Title' },
          { name: 'subtitle', type: 'text', default: 'Important Update', label: 'Subtitle' },
        ],
        html: `<div class="container">
          <div class="title">{{title}}</div>
          <div class="subtitle">{{subtitle}}</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          height: 100%;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%),
                      linear-gradient(135deg, #dc2626 0%, #7c3aed 100%);
          padding: 40px;
        }
        .title {
          font-size: 72px;
          font-weight: 900;
          color: white;
          text-transform: uppercase;
          line-height: 1;
          text-shadow: 4px 4px 0 #000;
        }
        .subtitle {
          font-size: 32px;
          font-weight: bold;
          color: #fef08a;
          margin-top: 10px;
        }`,
        isPublic: true,
      },

      // TikTok Story
      {
        name: 'TikTok Teaser',
        description: 'Vertical teaser for TikTok',
        category: 'story',
        platform: 'tiktok',
        width: 1080,
        height: 1920,
        variables: [
          { name: 'hook', type: 'text', default: 'Wait for it...', label: 'Hook' },
          { name: 'title', type: 'text', default: "You won't believe this", label: 'Title' },
        ],
        html: `<div class="container">
          <div class="hook">{{hook}}</div>
          <div class="title">{{title}}</div>
          <div class="arrow">↓</div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          padding: 60px;
        }
        .hook {
          font-size: 32px;
          color: #00f2ea;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .title {
          font-size: 56px;
          font-weight: bold;
          color: white;
          text-align: center;
          margin-top: 40px;
          line-height: 1.2;
        }
        .arrow {
          font-size: 64px;
          color: #ff0050;
          margin-top: 60px;
          animation: bounce 1s infinite;
        }`,
        isPublic: true,
      },

      // Universal - Gradient Card
      {
        name: 'Gradient Card',
        description: 'Modern gradient card design',
        category: 'tip',
        platform: 'universal',
        width: 1080,
        height: 1080,
        variables: [
          { name: 'number', type: 'text', default: '01', label: 'Number' },
          { name: 'title', type: 'text', default: 'Key Insight', label: 'Title' },
          { name: 'content', type: 'text', default: 'Your valuable content goes here', label: 'Content' },
        ],
        html: `<div class="container">
          <div class="card">
            <div class="number">{{number}}</div>
            <div class="title">{{title}}</div>
            <div class="content">{{content}}</div>
          </div>
        </div>`,
        css: `.container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 60px;
        }
        .card {
          background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 60px;
          width: 100%;
        }
        .number {
          font-size: 80px;
          font-weight: bold;
          color: rgba(99,102,241,0.5);
          line-height: 1;
        }
        .title {
          font-size: 48px;
          font-weight: bold;
          color: white;
          margin-top: 20px;
        }
        .content {
          font-size: 28px;
          color: rgba(255,255,255,0.7);
          margin-top: 20px;
          line-height: 1.6;
        }`,
        isPublic: true,
      },

      // LinkedIn - Dark Professional
      {
        name: 'Dark Professional',
        description: 'Dark theme professional template',
        category: 'quote',
        platform: 'linkedin',
        width: 1200,
        height: 627,
        variables: [
          { name: 'quote', type: 'text', default: 'Innovation distinguishes between a leader and a follower.', label: 'Quote' },
          { name: 'author', type: 'text', default: 'Steve Jobs', label: 'Author' },
          { name: 'role', type: 'text', default: 'Co-founder, Apple', label: 'Role' },
        ],
        html: `<div class="container">
          <div class="quote-mark">"</div>
          <div class="quote">{{quote}}</div>
          <div class="author-section">
            <div class="author">{{author}}</div>
            <div class="role">{{role}}</div>
          </div>
        </div>`,
        css: `.container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          background: #0f172a;
          padding: 60px 80px;
          position: relative;
        }
        .quote-mark {
          font-size: 200px;
          font-weight: bold;
          color: rgba(99,102,241,0.2);
          position: absolute;
          top: 20px;
          left: 40px;
          line-height: 1;
        }
        .quote {
          font-size: 36px;
          color: white;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }
        .author-section {
          margin-top: 30px;
          border-left: 3px solid #6366f1;
          padding-left: 20px;
        }
        .author {
          font-size: 24px;
          font-weight: bold;
          color: white;
        }
        .role {
          font-size: 18px;
          color: rgba(255,255,255,0.5);
          margin-top: 5px;
        }`,
        isPublic: true,
      },
    ];
  }
}
