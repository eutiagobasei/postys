import { IntegrationValidationTool } from '@postys/nestjs-libraries/chat/tools/integration.validation.tool';
import { IntegrationTriggerTool } from '@postys/nestjs-libraries/chat/tools/integration.trigger.tool';
import { IntegrationSchedulePostTool } from './integration.schedule.post';
import { GenerateVideoOptionsTool } from '@postys/nestjs-libraries/chat/tools/generate.video.options.tool';
import { VideoFunctionTool } from '@postys/nestjs-libraries/chat/tools/video.function.tool';
import { GenerateVideoTool } from '@postys/nestjs-libraries/chat/tools/generate.video.tool';
import { GenerateImageTool } from '@postys/nestjs-libraries/chat/tools/generate.image.tool';
import { IntegrationListTool } from '@postys/nestjs-libraries/chat/tools/integration.list.tool';

export const toolList = [
  IntegrationListTool,
  IntegrationValidationTool,
  IntegrationTriggerTool,
  IntegrationSchedulePostTool,
  GenerateVideoOptionsTool,
  VideoFunctionTool,
  GenerateVideoTool,
  GenerateImageTool,
];
