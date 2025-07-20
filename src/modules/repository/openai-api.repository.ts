import { ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { RequestOptions } from 'openai/internal/request-options';
import {
  CreateEmbeddingResponse,
  EmbeddingCreateParams,
} from 'openai/resources/embeddings';
import {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/index';

export class OpenaiApiRepository {
  private openai: OpenAI;
  private options: RequestOptions;

  constructor() {
    this.openai = new OpenAI({
      apiKey: '',
      baseURL: process.env.BASE_URL,
    });

    this.options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPEN_AI_BEARER_TOKEN}`,
      },
    };
  }

  async generateTextEmbeddings(text: string): Promise<CreateEmbeddingResponse> {
    try {
      const body: EmbeddingCreateParams = {
        input: text,
        model: 'text-embedding-3-large',
      };

      return await this.openai.embeddings.create(body, this.options);
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException('Failed request to OpenAI');
    }
  }

  async generateCompletion(
    messages: (
      | ChatCompletionSystemMessageParam
      | ChatCompletionUserMessageParam
    )[],
  ): Promise<ChatCompletion> {
    try {
      const body: ChatCompletionCreateParams = {
        model: 'gpt-4o',
        messages,
      };

      return await this.openai.chat.completions.create(body, this.options);
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException('Failed request to OpenAI');
    }
  }
}
