import { Injectable } from '@nestjs/common';
import { OpenaiApiRepository } from '../repository/openai-api.repository';
import { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import { ChatCompletion, ChatCompletionMessage } from 'openai/resources/index';

@Injectable()
export class OpenaiApiService {
  constructor(private readonly openaiApiRepository: OpenaiApiRepository) {}

  async generateTextEmbeddings(text: string): Promise<CreateEmbeddingResponse> {
    return await this.openaiApiRepository.generateTextEmbeddings(text);
  }

  async generateCompletion(
    messages: ChatCompletionMessage[],
  ): Promise<ChatCompletion> {
    return await this.openaiApiRepository.generateCompletion(messages);
  }
}
