import { Global, Module } from '@nestjs/common';
import { ImagesSlides } from '@postys/nestjs-libraries/videos/images-slides/images.slides';
import { VideoManager } from '@postys/nestjs-libraries/videos/video.manager';
import { Veo3 } from '@postys/nestjs-libraries/videos/veo3/veo3';

@Global()
@Module({
  providers: [ImagesSlides, Veo3, VideoManager],
  get exports() {
    return this.providers;
  },
})
export class VideoModule {}
