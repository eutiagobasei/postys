import { Global, Module } from '@nestjs/common';
import { LoadToolsService } from '@postys/nestjs-libraries/chat/load.tools.service';
import { MastraService } from '@postys/nestjs-libraries/chat/mastra.service';
import { toolList } from '@postys/nestjs-libraries/chat/tools/tool.list';

@Global()
@Module({
  providers: [MastraService, LoadToolsService, ...toolList],
  get exports() {
    return this.providers;
  },
})
export class ChatModule {}
