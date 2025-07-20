import { Injectable } from '@nestjs/common';
import { CompletionRequestDto } from '../dto/completion-request.dto';
import { OpenaiApiService } from 'src/modules/service/openai-api.service';
import { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import { CloudIAService } from 'src/modules/service/claud-ia.service';
import { ClaudSearchResponse } from 'src/modules/interface/claudSearchResponse-interface';
import {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/index';
import { CompletionResponseDto } from '../dto/completion-response.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly openaiApiService: OpenaiApiService,
    private readonly claudIaService: CloudIAService,
  ) {}

  async generateCompletion(
    completion: CompletionRequestDto,
  ): Promise<CompletionResponseDto> {
    const { projectName, messages } = completion;
    const generateEmbeddingsPromises: Promise<CreateEmbeddingResponse>[] = [];
    const embeddingsAnswers: Promise<ClaudSearchResponse>[] = [];

    messages.forEach(({ content }) => {
      generateEmbeddingsPromises.push(
        this.openaiApiService.generateTextEmbeddings(content),
      );
    });

    const userEmbeddings = await Promise.all(generateEmbeddingsPromises);

    userEmbeddings.forEach(({ data }) => {
      embeddingsAnswers.push(
        this.retrieveRelatedTexts(projectName, data[0].embedding),
      );
    });

    const answers: ClaudSearchResponse[] = await Promise.all(embeddingsAnswers);

    const systemMessage: ChatCompletionSystemMessageParam = {
      role: 'system',
      content:
        'You are a helpful assistant that provides information based on the provided context.',
    };

    const userContent: string =
      'Hello! How long does a Tesla battery last before it needs to be replaced?';

    const userMessage: ChatCompletionUserMessageParam = {
      role: 'user',
      content: userContent,
    };

    const completionMessages: any[] = [systemMessage, userMessage];

    const agentAnswer: ChatCompletion =
      await this.openaiApiService.generateCompletion(completionMessages);

    const completionResponse: CompletionResponseDto = {
      messages: [
        { role: 'USER', content: userContent },
        {
          role: 'AGENT',
          content:
            agentAnswer.choices[0].message.content || 'No response from agent',
        },
      ],
      handoverToHumanNeeded: false,
      sectionsRetrieved: answers[0].value.map(
        ({ ['@search.score']: score, content, type }) => ({ score, content }),
      ),
    };

    return completionResponse;
  }

  private async retrieveRelatedTexts(
    projectName: string,
    embeddings: number[],
  ) {
    return await this.claudIaService.searchEmbeddingsByProjectName(
      projectName,
      embeddings,
    );
  }
}
