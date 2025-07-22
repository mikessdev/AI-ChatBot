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

    const agentCompletion: ChatCompletion =
      await this.openaiApiService.generateCompletion(completionMessages);

    const isUncertain = contextualContent.length
      ? contextualContent[0].score < 0.51
      : true;

    const agentAnswer = isUncertain
      ? 'Desculpe, não consegui entender completamente sua pergunta. Poderia, por gentileza, fornecer mais detalhes ou reformular para que eu possa te ajudar melhor? 😊'
      : agentCompletion.choices[0].message.content;

    const completionResponse: CompletionResponseDto = {
      messages: [
        this.generateCustomMessage('USER', userContent),
        this.generateCustomMessage(
          'AGENT',
          agentAnswer || 'No response from agent',
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
      ({ ['@search.score']: score, content }) => ({ score, content }),
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
      content: `You are a AI assistante named Claudia, you should be polite and you like to use emoticons when asnwer questions, and you will answer the users questions based on the context provided. you need first apresent youself as a AI assistant for the user and then answer the question, the answers need to be short and you dont need to guess adictional informations about the questions, if you realized that the context provided is not enough to answer the question, you should ask for more information and if you realize that the context provided is not related to the user question, you will invited the user for make more questions`,
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
