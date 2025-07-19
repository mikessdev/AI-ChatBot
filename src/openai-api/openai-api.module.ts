import { Module } from '@nestjs/common';
import { OpenaiApiService } from './openai-api.service';
import { OpenaiApiRepository } from './openai-api.repository';

@Module({
  controllers: [],
  providers: [OpenaiApiService, OpenaiApiRepository],
  exports: [OpenaiApiService],
  imports: [],
})
export class OpenaiApiModule {}
