import { Injectable } from '@nestjs/common';
import { OpenaiApiRepository } from './openai-api.repository';
import { CreateEmbeddingResponse } from 'openai/resources/embeddings';

@Injectable()
export class OpenaiApiService {
  constructor(private readonly openaiApiRepository: OpenaiApiRepository) {}

  async generateEmbeddings(text: string): Promise<CreateEmbeddingResponse> {
    return await this.openaiApiRepository.generateEmbeddings(text);
  }
}
