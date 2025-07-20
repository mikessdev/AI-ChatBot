import { Module } from '@nestjs/common';
import { OpenaiApiService } from './service/openai-api.service';
import { OpenaiApiRepository } from './repository/openai-api.repository';

@Module({
  controllers: [],
  providers: [OpenaiApiService, OpenaiApiRepository],
  exports: [OpenaiApiService],
  imports: [],
})
export class OpenaiApiModule {}
