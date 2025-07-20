import OpenAI from 'openai';
import { RequestOptions } from 'openai/internal/request-options';
import {
  CreateEmbeddingResponse,
  EmbeddingCreateParams,
} from 'openai/resources/embeddings';

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

  async generateEmbeddings(text: string): Promise<CreateEmbeddingResponse> {
    const body: EmbeddingCreateParams = {
      input: text,
      model: 'text-embedding-3-large',
    };

    return await this.openai.embeddings.create(body, this.options);
  }
}
