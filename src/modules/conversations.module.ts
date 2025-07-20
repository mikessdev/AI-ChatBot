import { Module } from '@nestjs/common';
import { ConversationsController } from './controller/conversations.controller';
import { ConversationsService } from './service/conversations.service';
import { ClaudIaModule } from 'src/modules/claud-ia.module';
import { OpenaiApiModule } from './openai-api.module';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [],
  imports: [OpenaiApiModule, ClaudIaModule],
})
export class ConversationsModule {}
