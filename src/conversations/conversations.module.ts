import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { OpenaiApiModule } from 'src/openai-api/openai-api.module';
import { ClaudIaModule } from 'src/claud-ia/claud-ia.module';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [],
  imports: [OpenaiApiModule, ClaudIaModule],
})
export class ConversationsModule {}
