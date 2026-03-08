import { Module } from '@nestjs/common';
import { PostActivity } from '@postys/orchestrator/activities/post.activity';
import { getTemporalModule } from '@postys/nestjs-libraries/temporal/temporal.module';
import { DatabaseModule } from '@postys/nestjs-libraries/database/prisma/database.module';
import { AutopostService } from '@postys/nestjs-libraries/database/prisma/autopost/autopost.service';
import { EmailActivity } from '@postys/orchestrator/activities/email.activity';
import { IntegrationsActivity } from '@postys/orchestrator/activities/integrations.activity';

const activities = [
  PostActivity,
  AutopostService,
  EmailActivity,
  IntegrationsActivity,
];
@Module({
  imports: [
    DatabaseModule,
    getTemporalModule(true, require.resolve('./workflows'), activities),
  ],
  controllers: [],
  providers: [...activities],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}
