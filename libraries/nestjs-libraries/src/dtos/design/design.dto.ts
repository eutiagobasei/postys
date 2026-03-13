import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsUUID,
  IsBoolean,
  IsIn,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateVariableDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['text', 'image', 'color'])
  type: string;

  @IsString()
  @IsOptional()
  default?: string;

  @IsString()
  @IsOptional()
  label?: string;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['quote', 'promo', 'announcement', 'tip', 'story'])
  category: string;

  @IsString()
  @IsIn(['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'universal'])
  platform: string;

  @IsString()
  html: string;

  @IsString()
  css: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables: TemplateVariableDto[];

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class GenerateDesignDto {
  @IsString()
  postContent: string;

  @IsString()
  @IsIn(['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'universal'])
  platform: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;
}

export class GenerateFromTemplateDto {
  @IsUUID()
  templateId: string;

  @IsObject()
  variables: Record<string, string>;

  @IsString()
  @IsOptional()
  name?: string;
}

export class RenderDesignDto {
  @IsString()
  html: string;

  @IsString()
  css: string;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export class ListTemplatesQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['quote', 'promo', 'announcement', 'tip', 'story'])
  category?: string;

  @IsString()
  @IsOptional()
  @IsIn(['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'universal'])
  platform?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;
}
