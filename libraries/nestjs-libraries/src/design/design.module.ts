import { Global, Module } from '@nestjs/common';
import { DesignService } from './design.service';
import { DesignRepository } from './design.repository';
import { TemplateService } from './template.service';
import { TemplateRepository } from './template.repository';
import { RenderService } from './render.service';
import { DesignAIService } from './design-ai.service';

@Global()
@Module({
  providers: [
    DesignService,
    DesignRepository,
    TemplateService,
    TemplateRepository,
    RenderService,
    DesignAIService,
  ],
  exports: [
    DesignService,
    DesignRepository,
    TemplateService,
    TemplateRepository,
    RenderService,
    DesignAIService,
  ],
})
export class DesignModule {}
