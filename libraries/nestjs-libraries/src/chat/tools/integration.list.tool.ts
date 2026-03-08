import {
  AgentToolInterface,
  ToolReturn,
} from '@postys/nestjs-libraries/chat/agent.tool.interface';
import { createTool } from '@mastra/core/tools';
import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@postys/nestjs-libraries/database/prisma/integrations/integration.service';
import z from 'zod';
import { checkAuth } from '@postys/nestjs-libraries/chat/auth.context';
import { getAuth } from '@postys/nestjs-libraries/chat/async.storage';

@Injectable()
export class IntegrationListTool implements AgentToolInterface {
  constructor(private _integrationService: IntegrationService) {}
  name = 'integrationList';

  run() {
    return createTool({
      id: 'integrationList',
      description: `This tool list available integrations to schedule posts to`,
      outputSchema: z.object({
        output: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            picture: z.string(),
            platform: z.string(),
          })
        ),
      }),
      execute: async (inputData, context) => {
        console.log(getAuth());
        console.log(context);
        checkAuth(inputData, context);
        const organizationId = JSON.parse(
          (context.requestContext as any)?.get('organization') || '{}'
        ).id;

        return {
          output: (
            await this._integrationService.getIntegrationsList(organizationId)
          ).map((p) => ({
            name: p.name,
            id: p.id,
            disabled: p.disabled,
            picture: p.picture || '/no-picture.jpg',
            platform: p.providerIdentifier,
            display: p.profile,
            type: p.type,
          })),
        };
      },
    });
  }
}
