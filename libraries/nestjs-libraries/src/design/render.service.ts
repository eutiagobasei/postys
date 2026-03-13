import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, loadImage, registerFont, CanvasRenderingContext2D } from 'canvas';
import { UploadFactory } from '@postys/nestjs-libraries/upload/upload.factory';
import { Readable } from 'stream';

interface RenderOptions {
  width: number;
  height: number;
  html: string;
  css: string;
  variables: Record<string, string>;
}

interface ParsedElement {
  type: string;
  tag?: string;
  content?: string;
  attributes?: Record<string, string>;
  children?: ParsedElement[];
}

interface StyleRule {
  selector: string;
  properties: Record<string, string>;
}

@Injectable()
export class RenderService {
  private readonly logger = new Logger(RenderService.name);
  private storage = UploadFactory.createStorage();

  /**
   * Renders HTML/CSS template to an image using canvas.
   * This is a simplified renderer that handles basic template layouts.
   */
  async renderTemplate(options: RenderOptions): Promise<string> {
    const { width, height, html, css, variables } = options;

    // Replace variables in HTML
    const processedHtml = this.replaceVariables(html, variables);
    const styles = this.parseCSS(css);

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Parse HTML and render
    const elements = this.parseSimpleHTML(processedHtml);
    await this.renderElements(ctx, elements, styles, { x: 0, y: 0, width, height });

    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/png');
    const file = await this.uploadBuffer(buffer);

    return file;
  }

  /**
   * Renders a design with a background image and text overlay.
   * This is the most common use case for social media designs.
   */
  async renderDesignWithBackground(options: {
    width: number;
    height: number;
    backgroundUrl?: string;
    backgroundColor?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    title?: string;
    subtitle?: string;
    cta?: string;
    fontFamily?: string;
    titleColor?: string;
    textColor?: string;
    layout?: 'center' | 'top' | 'bottom';
  }): Promise<string> {
    const {
      width,
      height,
      backgroundUrl,
      backgroundColor = '#1a1a2e',
      overlayColor = '#000000',
      overlayOpacity = 0.5,
      title,
      subtitle,
      cta,
      titleColor = '#ffffff',
      textColor = '#f0f0f0',
      layout = 'center',
    } = options;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw background
    if (backgroundUrl) {
      try {
        const bgImage = await loadImage(backgroundUrl);
        // Cover the canvas while maintaining aspect ratio
        const scale = Math.max(width / bgImage.width, height / bgImage.height);
        const scaledWidth = bgImage.width * scale;
        const scaledHeight = bgImage.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);
      } catch (error) {
        this.logger.warn('Failed to load background image, using solid color');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw overlay for better text readability
    if (overlayOpacity > 0) {
      ctx.fillStyle = overlayColor;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    // Calculate text positioning based on layout
    const padding = Math.min(width, height) * 0.08;
    const textWidth = width - padding * 2;
    let textY: number;

    switch (layout) {
      case 'top':
        textY = padding + height * 0.15;
        break;
      case 'bottom':
        textY = height * 0.55;
        break;
      default: // center
        textY = height * 0.35;
    }

    // Draw title
    if (title) {
      const titleFontSize = Math.min(width * 0.08, 72);
      ctx.font = `bold ${titleFontSize}px sans-serif`;
      ctx.fillStyle = titleColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const wrappedTitle = this.wrapText(ctx, title, textWidth);
      const lineHeight = titleFontSize * 1.2;

      wrappedTitle.forEach((line, index) => {
        ctx.fillText(line, width / 2, textY + index * lineHeight);
      });

      textY += wrappedTitle.length * lineHeight + padding * 0.5;
    }

    // Draw subtitle
    if (subtitle) {
      const subtitleFontSize = Math.min(width * 0.045, 36);
      ctx.font = `${subtitleFontSize}px sans-serif`;
      ctx.fillStyle = textColor;

      const wrappedSubtitle = this.wrapText(ctx, subtitle, textWidth);
      const lineHeight = subtitleFontSize * 1.4;

      wrappedSubtitle.forEach((line, index) => {
        ctx.fillText(line, width / 2, textY + index * lineHeight);
      });

      textY += wrappedSubtitle.length * lineHeight + padding * 0.5;
    }

    // Draw CTA
    if (cta) {
      const ctaFontSize = Math.min(width * 0.04, 28);
      const ctaPadding = ctaFontSize * 0.6;

      ctx.font = `bold ${ctaFontSize}px sans-serif`;
      const ctaWidth = ctx.measureText(cta).width + ctaPadding * 2;
      const ctaHeight = ctaFontSize + ctaPadding * 2;

      // CTA button background
      ctx.fillStyle = titleColor;
      const ctaX = (width - ctaWidth) / 2;
      const ctaY = textY + padding * 0.5;

      this.roundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 8);
      ctx.fill();

      // CTA text
      ctx.fillStyle = backgroundColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cta, width / 2, ctaY + ctaHeight / 2);
    }

    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/png');
    return this.uploadBuffer(buffer);
  }

  /**
   * Simple CSS parser for basic styles.
   */
  private parseCSS(css: string): StyleRule[] {
    const rules: StyleRule[] = [];
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const propertiesStr = match[2];
      const properties: Record<string, string> = {};

      propertiesStr.split(';').forEach((prop) => {
        const [key, value] = prop.split(':').map((s) => s.trim());
        if (key && value) {
          properties[key] = value;
        }
      });

      rules.push({ selector, properties });
    }

    return rules;
  }

  /**
   * Replace template variables like {{title}} with actual values.
   */
  private replaceVariables(html: string, variables: Record<string, string>): string {
    let result = html;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  /**
   * Simple HTML parser for basic elements.
   */
  private parseSimpleHTML(html: string): ParsedElement[] {
    const elements: ParsedElement[] = [];
    const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      const [, tag, attributesStr, content] = match;
      const attributes = this.parseAttributes(attributesStr);

      elements.push({
        type: 'element',
        tag,
        attributes,
        content: content.trim(),
        children: this.parseSimpleHTML(content),
      });
    }

    return elements;
  }

  private parseAttributes(str: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match;

    while ((match = attrRegex.exec(str)) !== null) {
      attrs[match[1]] = match[2];
    }

    return attrs;
  }

  /**
   * Render parsed elements to canvas.
   */
  private async renderElements(
    ctx: CanvasRenderingContext2D,
    elements: ParsedElement[],
    styles: StyleRule[],
    bounds: { x: number; y: number; width: number; height: number }
  ): Promise<void> {
    for (const element of elements) {
      if (!element.tag) continue;

      const elementStyles = this.getStylesForElement(element, styles);
      await this.renderElement(ctx, element, elementStyles, bounds);
    }
  }

  private getStylesForElement(
    element: ParsedElement,
    styles: StyleRule[]
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const rule of styles) {
      const selector = rule.selector.toLowerCase();
      const tag = element.tag?.toLowerCase();
      const className = element.attributes?.class;
      const id = element.attributes?.id;

      if (
        selector === tag ||
        (className && selector === `.${className}`) ||
        (id && selector === `#${id}`)
      ) {
        Object.assign(result, rule.properties);
      }
    }

    return result;
  }

  private async renderElement(
    ctx: CanvasRenderingContext2D,
    element: ParsedElement,
    styles: Record<string, string>,
    bounds: { x: number; y: number; width: number; height: number }
  ): Promise<void> {
    const backgroundColor = styles['background-color'] || styles['background'];
    const color = styles['color'] || '#000000';
    const fontSize = parseInt(styles['font-size'] || '16', 10);
    const fontWeight = styles['font-weight'] || 'normal';
    const textAlign = (styles['text-align'] || 'left') as CanvasTextAlign;

    // Draw background if specified
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // Draw text content
    if (element.content && !element.children?.length) {
      ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      const padding = 20;
      const textX =
        textAlign === 'center'
          ? bounds.x + bounds.width / 2
          : textAlign === 'right'
          ? bounds.x + bounds.width - padding
          : bounds.x + padding;

      ctx.fillText(element.content, textX, bounds.y + padding, bounds.width - padding * 2);
    }
  }

  /**
   * Wrap text to fit within a maximum width.
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Draw a rounded rectangle.
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Upload a buffer to storage and return the URL.
   */
  private async uploadBuffer(buffer: Buffer): Promise<string> {
    const file = await this.storage.uploadFile({
      buffer,
      mimetype: 'image/png',
      size: buffer.length,
      path: '',
      fieldname: 'design',
      destination: '',
      stream: new Readable(),
      filename: `design-${Date.now()}.png`,
      originalname: `design-${Date.now()}.png`,
      encoding: 'binary',
    });

    return file.path;
  }
}
