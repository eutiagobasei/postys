import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from '@postys/backend/api/routes/auth.controller';
import { AuthService } from '@postys/backend/services/auth/auth.service';
import { UsersController } from '@postys/backend/api/routes/users.controller';
import { AuthMiddleware } from '@postys/backend/services/auth/auth.middleware';
import { StripeController } from '@postys/backend/api/routes/stripe.controller';
import { StripeService } from '@postys/nestjs-libraries/services/stripe.service';
import { AnalyticsController } from '@postys/backend/api/routes/analytics.controller';
import { PoliciesGuard } from '@postys/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@postys/backend/services/auth/permissions/permissions.service';
import { IntegrationsController } from '@postys/backend/api/routes/integrations.controller';
import { IntegrationManager } from '@postys/nestjs-libraries/integrations/integration.manager';
import { SettingsController } from '@postys/backend/api/routes/settings.controller';
import { PostsController } from '@postys/backend/api/routes/posts.controller';
import { MediaController } from '@postys/backend/api/routes/media.controller';
import { UploadModule } from '@postys/nestjs-libraries/upload/upload.module';
import { BillingController } from '@postys/backend/api/routes/billing.controller';
import { NotificationsController } from '@postys/backend/api/routes/notifications.controller';
import { OpenaiService } from '@postys/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@postys/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@postys/nestjs-libraries/services/codes.service';
import { CopilotController } from '@postys/backend/api/routes/copilot.controller';
import { PublicController } from '@postys/backend/api/routes/public.controller';
import { RootController } from '@postys/backend/api/routes/root.controller';
import { TrackService } from '@postys/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@postys/nestjs-libraries/short-linking/short.link.service';
import { Nowpayments } from '@postys/nestjs-libraries/crypto/nowpayments';
import { WebhookController } from '@postys/backend/api/routes/webhooks.controller';
import { SignatureController } from '@postys/backend/api/routes/signature.controller';
import { AutopostController } from '@postys/backend/api/routes/autopost.controller';
import { SetsController } from '@postys/backend/api/routes/sets.controller';
import { ThirdPartyController } from '@postys/backend/api/routes/third-party.controller';
import { MonitorController } from '@postys/backend/api/routes/monitor.controller';
import { NoAuthIntegrationsController } from '@postys/backend/api/routes/no.auth.integrations.controller';
import { EnterpriseController } from '@postys/backend/api/routes/enterprise.controller';
import { OAuthAppController } from '@postys/backend/api/routes/oauth-app.controller';
import { ApprovedAppsController } from '@postys/backend/api/routes/approved-apps.controller';
import { OAuthController, OAuthAuthorizedController } from '@postys/backend/api/routes/oauth.controller';
import { AppSumoController } from '@postys/backend/api/routes/appsumo.controller';
import { AppSumoService } from '@postys/nestjs-libraries/services/appsumo.service';
import { DesignController } from '@postys/backend/api/routes/design.controller';
import { DesignModule } from '@postys/nestjs-libraries/design/design.module';
import { AuthProviderManager } from '@postys/backend/services/auth/providers/providers.manager';
import { GithubProvider } from '@postys/backend/services/auth/providers/github.provider';
import { GoogleProvider } from '@postys/backend/services/auth/providers/google.provider';
import { FarcasterProvider } from '@postys/backend/services/auth/providers/farcaster.provider';
import { WalletProvider } from '@postys/backend/services/auth/providers/wallet.provider';
import { OauthProvider } from '@postys/backend/services/auth/providers/oauth.provider';
import { AppSumoProvider } from '@postys/backend/services/auth/providers/appsumo.provider';

const authenticatedController = [
  UsersController,
  AnalyticsController,
  IntegrationsController,
  SettingsController,
  PostsController,
  MediaController,
  BillingController,
  NotificationsController,
  CopilotController,
  WebhookController,
  SignatureController,
  AutopostController,
  SetsController,
  ThirdPartyController,
  OAuthAppController,
  ApprovedAppsController,
  OAuthAuthorizedController,
  DesignController,
];
@Module({
  imports: [UploadModule, DesignModule],
  controllers: [
    RootController,
    StripeController,
    AppSumoController,
    AuthController,
    PublicController,
    MonitorController,
    EnterpriseController,
    NoAuthIntegrationsController,
    OAuthController,
    ...authenticatedController,
  ],
  providers: [
    AuthService,
    StripeService,
    AppSumoService,
    OpenaiService,
    ExtractContentService,
    AuthMiddleware,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    TrackService,
    ShortLinkService,
    Nowpayments,
    AuthProviderManager,
    GithubProvider,
    GoogleProvider,
    FarcasterProvider,
    WalletProvider,
    OauthProvider,
    AppSumoProvider,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authenticatedController);
  }
}
