import { Injectable } from '@nestjs/common';
import { CompletionRequestDto } from './dto/completion-request.dto';
import { OpenaiApiService } from 'src/openai-api/openai-api.service';
import {
  CreateEmbeddingResponse,
  Embedding,
} from 'openai/resources/embeddings';
import { CloudIAService } from 'src/claud-ia/claud-ia.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly openaiApiService: OpenaiApiService,
    private readonly claudIaService: CloudIAService,
  ) {}

  async generateCompletion(completion: CompletionRequestDto) {
    const { projectName, messages } = completion;
    const generateEmbeddingsPromises: Promise<CreateEmbeddingResponse>[] = [];
    const embeddingsAnswers: any[] = [];

    messages.forEach(({ content }) => {
      generateEmbeddingsPromises.push(
        this.openaiApiService.generateEmbeddings(content),
      );
    });

    const userEmbeddings = await Promise.all(generateEmbeddingsPromises);

    userEmbeddings.forEach(({ data }) => {
      embeddingsAnswers.push(
        this.searchEmbeddingsByProjectName(projectName, data[0].embedding),
      );
    });

    const answers: any[] = await Promise.all(embeddingsAnswers);

    return 'Hello World';
  }

  private async searchEmbeddingsByProjectName(
    projectName: string,
    embeddings: number[],
  ) {
    return await this.claudIaService.searchEmbeddings(projectName, embeddings);
  }
}
