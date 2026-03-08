import { HttpException, Injectable, Logger } from '@nestjs/common';
import { MediaRepository } from '@postys/nestjs-libraries/database/prisma/media/media.repository';
import { OpenaiService } from '@postys/nestjs-libraries/openai/openai.service';
import { GeminiService } from '@postys/nestjs-libraries/openai/gemini.service';
import { SubscriptionService } from '@postys/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { Organization } from '@prisma/client';
import { SaveMediaInformationDto } from '@postys/nestjs-libraries/dtos/media/save.media.information.dto';
import { VideoManager } from '@postys/nestjs-libraries/videos/video.manager';
import { VideoDto } from '@postys/nestjs-libraries/dtos/videos/video.dto';
import { UploadFactory } from '@postys/nestjs-libraries/upload/upload.factory';
import {
  AuthorizationActions,
  Sections,
  SubscriptionException,
} from '@postys/backend/services/auth/permissions/permission.exception.class';

@Injectable()
export class MediaService {
  private storage = UploadFactory.createStorage();
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private _mediaRepository: MediaRepository,
    private _openAi: OpenaiService,
    private _gemini: GeminiService,
    private _subscriptionService: SubscriptionService,
    private _videoManager: VideoManager
  ) {}

  async deleteMedia(org: string, id: string) {
    return this._mediaRepository.deleteMedia(org, id);
  }

  getMediaById(id: string) {
    return this._mediaRepository.getMediaById(id);
  }

  async generateImage(
    prompt: string,
    org: Organization,
    generatePromptFirst?: boolean
  ) {
    const generating = await this._subscriptionService.useCredit(
      org,
      'ai_images',
      async () => {
        if (generatePromptFirst) {
          // Try Gemini first for prompt generation, fallback to OpenAI
          try {
            if (this._gemini.isConfigured()) {
              prompt = await this._gemini.generatePromptForPicture(prompt);
            } else {
              prompt = await this._openAi.generatePromptForPicture(prompt);
            }
          } catch (err) {
            this.logger.warn('Prompt generation failed, using original prompt');
          }
        }

        // Try Gemini first if configured, fallback to OpenAI
        if (this._gemini.isConfigured()) {
          try {
            this.logger.log('Generating image with Gemini...');
            return await this._gemini.generateImage(prompt);
          } catch (geminiError) {
            this.logger.warn('Gemini image generation failed, trying OpenAI...', geminiError);
          }
        }

        // Fallback to OpenAI
        return this._openAi.generateImage(prompt, !!generatePromptFirst);
      }
    );

    return generating;
  }

  saveFile(org: string, fileName: string, filePath: string, originalName?: string) {
    return this._mediaRepository.saveFile(org, fileName, filePath, originalName);
  }

  getMedia(org: string, page: number) {
    return this._mediaRepository.getMedia(org, page);
  }

  saveMediaInformation(org: string, data: SaveMediaInformationDto) {
    return this._mediaRepository.saveMediaInformation(org, data);
  }

  getVideoOptions() {
    return this._videoManager.getAllVideos();
  }

  async generateVideoAllowed(org: Organization, type: string) {
    const video = this._videoManager.getVideoByName(type);
    if (!video) {
      throw new Error(`Video type ${type} not found`);
    }

    if (!video.trial && org.isTrailing) {
      throw new HttpException('This video is not available in trial mode', 406);
    }

    return true;
  }

  async generateVideo(org: Organization, body: VideoDto) {
    const totalCredits = await this._subscriptionService.checkCredits(
      org,
      'ai_videos'
    );

    if (totalCredits.credits <= 0) {
      throw new SubscriptionException({
        action: AuthorizationActions.Create,
        section: Sections.VIDEOS_PER_MONTH,
      });
    }

    const video = this._videoManager.getVideoByName(body.type);
    if (!video) {
      throw new Error(`Video type ${body.type} not found`);
    }

    if (!video.trial && org.isTrailing) {
      throw new HttpException('This video is not available in trial mode', 406);
    }

    console.log(body.customParams);
    await video.instance.processAndValidate(body.customParams);
    console.log('no err');

    return await this._subscriptionService.useCredit(
      org,
      'ai_videos',
      async () => {
        const loadedData = await video.instance.process(
          body.output,
          body.customParams
        );

        const file = await this.storage.uploadSimple(loadedData);
        return this.saveFile(org.id, file.split('/').pop(), file);
      }
    );
  }

  async videoFunction(identifier: string, functionName: string, body: any) {
    const video = this._videoManager.getVideoByName(identifier);
    if (!video) {
      throw new Error(`Video with identifier ${identifier} not found`);
    }

    // @ts-ignore
    const functionToCall = video.instance[functionName];
    if (
      typeof functionToCall !== 'function' ||
      this._videoManager.checkAvailableVideoFunction(functionToCall)
    ) {
      throw new HttpException(
        `Function ${functionName} not found on video instance`,
        400
      );
    }

    return functionToCall(body);
  }
}
