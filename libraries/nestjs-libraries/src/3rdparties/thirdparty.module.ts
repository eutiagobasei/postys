import { Global, Module } from '@nestjs/common';
import { HeygenProvider } from '@postys/nestjs-libraries/3rdparties/heygen/heygen.provider';
import { DesignForgeProvider } from '@postys/nestjs-libraries/3rdparties/designforge/designforge.provider';
import { ThirdPartyManager } from '@postys/nestjs-libraries/3rdparties/thirdparty.manager';

@Global()
@Module({
  providers: [HeygenProvider, DesignForgeProvider, ThirdPartyManager],
  get exports() {
    return this.providers;
  },
})
export class ThirdPartyModule {}
