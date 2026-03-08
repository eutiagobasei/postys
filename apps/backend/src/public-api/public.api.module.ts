import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from '@postys/backend/services/auth/auth.service';
import { StripeService } from '@postys/nestjs-libraries/services/stripe.service';
import { PoliciesGuard } from '@postys/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@postys/backend/services/auth/permissions/permissions.service';
import { IntegrationManager } from '@postys/nestjs-libraries/integrations/integration.manager';
import { UploadModule } from '@postys/nestjs-libraries/upload/upload.module';
import { OpenaiService } from '@postys/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@postys/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@postys/nestjs-libraries/services/codes.service';
import { PublicIntegrationsController } from '@postys/backend/public-api/routes/v1/public.integrations.controller';
import { PublicAuthMiddleware } from '@postys/backend/services/auth/public.auth.middleware';

const authenticatedController = [PublicIntegrationsController];
@Module({
  imports: [UploadModule],
  controllers: [...authenticatedController],
  providers: [
    AuthService,
    StripeService,
    OpenaiService,
    ExtractContentService,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class PublicApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicAuthMiddleware).forRoutes(...authenticatedController);
  }
}

