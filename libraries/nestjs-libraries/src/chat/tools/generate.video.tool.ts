import { AgentToolInterface } from '@postys/nestjs-libraries/chat/agent.tool.interface';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import {
  IntegrationManager,
  socialIntegrationList,
} from '@postys/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@postys/nestjs-libraries/database/prisma/integrations/integration.service';
import { RefreshToken } from '@postys/nestjs-libraries/integrations/social.abstract';
import { timer } from '@postys/helpers/utils/timer';
import { MediaService } from '@postys/nestjs-libraries/database/prisma/media/media.service';
import { OrganizationService } from '@postys/nestjs-libraries/database/prisma/organizations/organization.service';
import { VideoManager } from '@postys/nestjs-libraries/videos/video.manager';
import { checkAuth } from '@postys/nestjs-libraries/chat/auth.context';

@Injectable()
export class GenerateVideoTool implements AgentToolInterface {
  constructor(
    private _mediaService: MediaService,
    private _videoManager: VideoManager
  ) {}
  name = 'generateVideoTool';

  run() {
    return createTool({
      id: 'generateVideoTool',
      description: `Generate video to use in a post,
                    in case the user specified a platform that requires attachment and attachment was not provided,
                    ask if they want to generate a picture of a video.
                    In many cases 'videoFunctionTool' will need to be called first, to get things like voice id
                    Here are the type of video that can be generated:
                    ${this._videoManager
                      .getAllVideos()
                      .map((p) => "-" + p.title)
                      .join('\n')}
      `,
      inputSchema: z.object({
        identifier: z.string(),
        output: z.enum(['vertical', 'horizontal']),
        customParams: z.array(
          z.object({
            key: z.string().describe('Name of the settings key to pass'),
            value: z.any().describe('Value of the key'),
          })
        ),
      }),
      outputSchema: z.object({
        url: z.string(),
      }),
      execute: async (inputData, context) => {
        checkAuth(inputData, context);
        const org = JSON.parse((context.requestContext as any)?.get('organization') || '{}');
        const value = await this._mediaService.generateVideo(org, {
          type: inputData.identifier,
          output: inputData.output,
          customParams: inputData.customParams.reduce(
            (all, current) => ({
              ...all,
              [current.key]: current.value,
            }),
            {}
          ),
        });

        return {
          url: value.path,
        };
      },
    });
  }
}
