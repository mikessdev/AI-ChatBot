import { Injectable } from '@nestjs/common';
import {
  CompletionRequestDto,
  MessageDto,
} from '../dto/completion-request.dto';
import { OpenaiApiService } from 'src/modules/service/openai-api.service';
import { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import { CloudIAService } from 'src/modules/service/claud-ia.service';
import { ClaudSearchResponse } from 'src/modules/interface/claudSearchResponse-interface';
import {
  ChatCompletion,
  ChatCompletionRole,
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

    //QUESTION: should accept more than one message?
    const userContent = messages[0].content;

    const userEmbeddings = await this.generateEmbeddingsForMessages(messages);

    const relatedTexts = await this.retrieveRelatedTextsForEmbeddings(
      projectName,
      userEmbeddings,
    );

    const contextualContent = this.buildContextualContent(relatedTexts);
    const systemMessage = this.generateSystemMessage();
    const userMessage = this.generateUserMessage(userContent);

    const completionMessages: (
      | ChatCompletionSystemMessageParam
      | ChatCompletionUserMessageParam
    )[] = [systemMessage, userMessage];

    const agentAnswer: ChatCompletion =
      await this.openaiApiService.generateCompletion(completionMessages);

    const completionResponse: CompletionResponseDto = {
      messages: [
        this.generateCustomMessage('USER', userContent),
        this.generateCustomMessage(
          'AGENT',
          agentAnswer.choices[0].message.content || 'No response from agent',
        ),
      ],
      handoverToHumanNeeded: false,
      sectionsRetrieved: contextualContent,
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

  private buildContextualContent(relatedTexts: ClaudSearchResponse[]) {
    return relatedTexts[0].value.map(
      ({ ['@search.score']: score, content, type }) => ({ score, content }),
    );
  }

  private async generateEmbeddingsForMessages(
    messages: MessageDto[],
  ): Promise<CreateEmbeddingResponse[]> {
    const embeddingPromises = messages.map(({ content }) =>
      this.openaiApiService.generateTextEmbeddings(content),
    );

    return Promise.all(embeddingPromises);
  }

  private async retrieveRelatedTextsForEmbeddings(
    projectName: string,
    embeddings: CreateEmbeddingResponse[],
  ): Promise<ClaudSearchResponse[]> {
    const searchPromises = embeddings.map(({ data }) =>
      this.retrieveRelatedTexts(projectName, data[0].embedding),
    );

    return Promise.all(searchPromises);
  }

  private generateCustomMessage(
    role: MessageDto['role'],
    content: MessageDto['content'],
  ): MessageDto {
    return {
      role,
      content,
    };
  }

  private generateSystemMessage(): ChatCompletionSystemMessageParam {
    return {
      role: 'system',
      content:
        "You are a helpful and friendly assistant. Always start your reply with 'Hello'. Your response must be based on the provided context — do not make assumptions. Keep your answer short, easy to understand, and pleasant in tone.",
    };
  }

  private generateUserMessage(
    userContent: string,
  ): ChatCompletionUserMessageParam {
    return {
      role: 'user',
      content: userContent,
    };
  }
}
