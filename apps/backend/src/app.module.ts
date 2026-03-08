import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '@postys/nestjs-libraries/database/prisma/database.module';
import { ApiModule } from '@postys/backend/api/api.module';
import { APP_GUARD } from '@nestjs/core';
import { PoliciesGuard } from '@postys/backend/services/auth/permissions/permissions.guard';
import { PublicApiModule } from '@postys/backend/public-api/public.api.module';
import { ThrottlerBehindProxyGuard } from '@postys/nestjs-libraries/throttler/throttler.provider';
import { ThrottlerModule } from '@nestjs/throttler';
import { AgentModule } from '@postys/nestjs-libraries/agent/agent.module';
import { ThirdPartyModule } from '@postys/nestjs-libraries/3rdparties/thirdparty.module';
import { VideoModule } from '@postys/nestjs-libraries/videos/video.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { FILTER } from '@postys/nestjs-libraries/sentry/sentry.exception';
import { ChatModule } from '@postys/nestjs-libraries/chat/chat.module';
import { getTemporalModule } from '@postys/nestjs-libraries/temporal/temporal.module';
import { TemporalRegisterMissingSearchAttributesModule } from '@postys/nestjs-libraries/temporal/temporal.register';
import { InfiniteWorkflowRegisterModule } from '@postys/nestjs-libraries/temporal/infinite.workflow.register';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ioRedis } from '@postys/nestjs-libraries/redis/redis.service';

@Global()
@Module({
  imports: [
    SentryModule.forRoot(),
    DatabaseModule,
    ApiModule,
    PublicApiModule,
    AgentModule,
    ThirdPartyModule,
    VideoModule,
    ChatModule,
    getTemporalModule(false),
    TemporalRegisterMissingSearchAttributesModule,
    InfiniteWorkflowRegisterModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 3600000,
          limit: process.env.API_LIMIT ? Number(process.env.API_LIMIT) : 30,
        },
      ],
      storage: new ThrottlerStorageRedisService(ioRedis),
    }),
  ],
  controllers: [],
  providers: [
    FILTER,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  exports: [
    DatabaseModule,
    ApiModule,
    PublicApiModule,
    AgentModule,
    ThrottlerModule,
    ChatModule,
  ],
})
export class AppModule {}
