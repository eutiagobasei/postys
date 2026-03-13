import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@postys/nestjs-libraries/user/org.from.request';
import { GetUserFromRequest } from '@postys/nestjs-libraries/user/user.from.request';
import { Organization, User } from '@prisma/client';
import { DesignService } from '@postys/nestjs-libraries/design/design.service';
import { TemplateService } from '@postys/nestjs-libraries/design/template.service';
import {
  GenerateDesignDto,
  GenerateFromTemplateDto,
  ListTemplatesQueryDto,
} from '@postys/nestjs-libraries/dtos/design/design.dto';

@ApiTags('Design')
@Controller('/design')
export class DesignController {
  constructor(
    private _designService: DesignService,
    private _templateService: TemplateService
  ) {}

  // ============ TEMPLATES ============

  @Get('/templates')
  @ApiOperation({ summary: 'List design templates' })
  @ApiResponse({ status: 200, description: 'Returns list of templates' })
  listTemplates(
    @GetOrgFromRequest() org: Organization,
    @Query() query: ListTemplatesQueryDto
  ) {
    return this._templateService.listTemplates(query, org.id);
  }

  @Get('/templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Returns template details' })
  getTemplate(@Param('id') id: string) {
    return this._templateService.getTemplateById(id);
  }

  @Get('/templates/platform/:platform')
  @ApiOperation({ summary: 'Get templates by platform' })
  @ApiResponse({ status: 200, description: 'Returns templates for platform' })
  getTemplatesByPlatform(
    @GetOrgFromRequest() org: Organization,
    @Param('platform') platform: string
  ) {
    return this._templateService.getTemplatesByPlatform(platform, org.id);
  }

  // ============ DESIGN GENERATION ============

  @Post('/generate')
  @ApiOperation({ summary: 'Generate design from post content using AI' })
  @ApiResponse({ status: 201, description: 'Returns generated design' })
  generateDesign(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization,
    @Body() body: GenerateDesignDto
  ) {
    return this._designService.generateDesign(body, user.id, org);
  }

  @Post('/generate-from-template')
  @ApiOperation({ summary: 'Generate design from template' })
  @ApiResponse({ status: 201, description: 'Returns generated design' })
  generateFromTemplate(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization,
    @Body() body: GenerateFromTemplateDto
  ) {
    return this._designService.generateFromTemplate(body, user.id, org);
  }

  @Post('/generate-multi')
  @ApiOperation({ summary: 'Generate designs for multiple platforms' })
  @ApiResponse({ status: 201, description: 'Returns generated designs' })
  generateMultiPlatform(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization,
    @Body('postContent') postContent: string,
    @Body('platforms') platforms: string[]
  ) {
    return this._designService.generateMultiPlatformDesigns(
      postContent,
      platforms,
      user.id,
      org
    );
  }

  // ============ DESIGNS ============

  @Get('/designs')
  @ApiOperation({ summary: 'List saved designs' })
  @ApiResponse({ status: 200, description: 'Returns list of designs' })
  listDesigns(
    @GetOrgFromRequest() org: Organization,
    @Query('page') page?: number
  ) {
    return this._designService.listDesigns(org.id, page);
  }

  @Get('/designs/:id')
  @ApiOperation({ summary: 'Get design by ID' })
  @ApiResponse({ status: 200, description: 'Returns design details' })
  getDesign(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._designService.getDesignById(id, org.id);
  }

  @Delete('/designs/:id')
  @ApiOperation({ summary: 'Delete a design' })
  @ApiResponse({ status: 200, description: 'Design deleted' })
  deleteDesign(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._designService.deleteDesign(id, org.id);
  }

  @Post('/designs/:id/update-variables')
  @ApiOperation({ summary: 'Update design variables and re-render' })
  @ApiResponse({ status: 200, description: 'Returns updated design' })
  updateDesignVariables(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body('variables') variables: Record<string, string>
  ) {
    return this._designService.updateDesignVariables(id, variables, org.id);
  }

  // ============ PLATFORMS ============

  @Get('/platforms')
  @ApiOperation({ summary: 'Get available platforms with dimensions' })
  @ApiResponse({ status: 200, description: 'Returns platform list' })
  getPlatforms() {
    return this._designService.getPlatforms();
  }
}
