import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService, PrismaTransaction } from './prisma.service';
import { OrganizationRepository } from '@postys/nestjs-libraries/database/prisma/organizations/organization.repository';
import { OrganizationService } from '@postys/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@postys/nestjs-libraries/database/prisma/users/users.service';
import { UsersRepository } from '@postys/nestjs-libraries/database/prisma/users/users.repository';
import { SubscriptionService } from '@postys/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { SubscriptionRepository } from '@postys/nestjs-libraries/database/prisma/subscriptions/subscription.repository';
import { NotificationService } from '@postys/nestjs-libraries/database/prisma/notifications/notification.service';
import { IntegrationService } from '@postys/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationRepository } from '@postys/nestjs-libraries/database/prisma/integrations/integration.repository';
import { PostsService } from '@postys/nestjs-libraries/database/prisma/posts/posts.service';
import { PostsRepository } from '@postys/nestjs-libraries/database/prisma/posts/posts.repository';
import { IntegrationManager } from '@postys/nestjs-libraries/integrations/integration.manager';
import { MediaService } from '@postys/nestjs-libraries/database/prisma/media/media.service';
import { MediaRepository } from '@postys/nestjs-libraries/database/prisma/media/media.repository';
import { NotificationsRepository } from '@postys/nestjs-libraries/database/prisma/notifications/notifications.repository';
import { EmailService } from '@postys/nestjs-libraries/services/email.service';
import { StripeService } from '@postys/nestjs-libraries/services/stripe.service';
import { ExtractContentService } from '@postys/nestjs-libraries/openai/extract.content.service';
import { OpenaiService } from '@postys/nestjs-libraries/openai/openai.service';
import { GeminiService } from '@postys/nestjs-libraries/openai/gemini.service';
import { AgenciesService } from '@postys/nestjs-libraries/database/prisma/agencies/agencies.service';
import { AgenciesRepository } from '@postys/nestjs-libraries/database/prisma/agencies/agencies.repository';
import { TrackService } from '@postys/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@postys/nestjs-libraries/short-linking/short.link.service';
import { WebhooksRepository } from '@postys/nestjs-libraries/database/prisma/webhooks/webhooks.repository';
import { WebhooksService } from '@postys/nestjs-libraries/database/prisma/webhooks/webhooks.service';
import { SignatureRepository } from '@postys/nestjs-libraries/database/prisma/signatures/signature.repository';
import { SignatureService } from '@postys/nestjs-libraries/database/prisma/signatures/signature.service';
import { AutopostRepository } from '@postys/nestjs-libraries/database/prisma/autopost/autopost.repository';
import { AutopostService } from '@postys/nestjs-libraries/database/prisma/autopost/autopost.service';
import { SetsService } from '@postys/nestjs-libraries/database/prisma/sets/sets.service';
import { SetsRepository } from '@postys/nestjs-libraries/database/prisma/sets/sets.repository';
import { ThirdPartyRepository } from '@postys/nestjs-libraries/database/prisma/third-party/third-party.repository';
import { ThirdPartyService } from '@postys/nestjs-libraries/database/prisma/third-party/third-party.service';
import { VideoManager } from '@postys/nestjs-libraries/videos/video.manager';
import { FalService } from '@postys/nestjs-libraries/openai/fal.service';
import { RefreshIntegrationService } from '@postys/nestjs-libraries/integrations/refresh.integration.service';
import { OAuthRepository } from '@postys/nestjs-libraries/database/prisma/oauth/oauth.repository';
import { OAuthService } from '@postys/nestjs-libraries/database/prisma/oauth/oauth.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    PrismaTransaction,
    UsersService,
    UsersRepository,
    OrganizationService,
    OrganizationRepository,
    SubscriptionService,
    SubscriptionRepository,
    NotificationService,
    NotificationsRepository,
    WebhooksRepository,
    WebhooksService,
    IntegrationService,
    IntegrationRepository,
    PostsService,
    PostsRepository,
    StripeService,
    SignatureRepository,
    AutopostRepository,
    AutopostService,
    SignatureService,
    MediaService,
    MediaRepository,
    AgenciesService,
    AgenciesRepository,
    IntegrationManager,
    RefreshIntegrationService,
    ExtractContentService,
    OpenaiService,
    GeminiService,
    FalService,
    EmailService,
    TrackService,
    ShortLinkService,
    SetsService,
    SetsRepository,
    ThirdPartyRepository,
    ThirdPartyService,
    OAuthRepository,
    OAuthService,
    VideoManager,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
