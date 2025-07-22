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
  systemPrompt: string = `
You are Claudia 😊, a friendly and helpful Tesla assistant. You must introduce yourself as "Claudia, your Tesla assistant 😊" only when there is no previous assistant message in the conversation. Your answers must include emojis frequently to keep a warm and cheerful tone 😊🚗⚡.
You MUST strictly answer using ONLY the information provided in the retrieved context ("sectionsRetrieved") and the previous messages ("messages").
❗ You are NOT allowed to add any facts, numbers, examples, or assumptions not explicitly mentioned in those sources.
❗ If the user asks a question that cannot be fully answered with the provided information, you must respond with exactly: {noAnswerMessage}
Be very strict with this policy.
`;

  noAnswerMessage: string =
    "Sorry, but I didn't fully understand your question. Could you please provide more details or rephrase the question so I can better assist you?";

  constructor(
    private readonly openaiApiService: OpenaiApiService,
    private readonly claudIaService: CloudIAService,
  ) {
    this.systemPrompt =
      this.systemPrompt + 'noAnswerMessage: ' + this.noAnswerMessage;
  }

  async generateCompletion(
    completion: CompletionRequestDto,
  ): Promise<CompletionResponseDto> {
    const { projectName, messages } = completion;

    const lastUserMessage = messages
      .filter(({ role }) => role === 'USER')
      .at(-1) || {
      role: 'USER',
      content: '',
    };

    if (this.checkClarification(messages) || !lastUserMessage.content) {
      messages.push({
        role: 'AGENT',
        content: `"Sorry, but I couldn't understand your question again 😕. To make sure you get the best help, I'll redirect our conversation to one of our human specialists 🧑‍💼✨"`,
      });

      const earlyResponse: CompletionResponseDto = {
        messages,
        handoverToHumanNeeded: true,
        sectionsRetrieved: [],
      };

      return earlyResponse;
    }

    const userEmbeddings = await this.generateEmbeddingsForMessages([
      lastUserMessage,
    ]);

    const relatedTexts = await this.retrieveRelatedTextsForEmbeddings(
      projectName,
      userEmbeddings,
    );

    const contextualContent = this.cleanRelatedTexts(relatedTexts);

    const systemMessage = this.generateSystemMessage(
      contextualContent.reduce((acc, curr) => {
        return acc + curr.content + ' ';
      }, ''),
    );

    const userMessage: ChatCompletionUserMessageParam[] = messages.map(
      ({ content }) => ({
        role: 'user',
        content,
      }),
    );

    const completionMessages: (
      | ChatCompletionSystemMessageParam
      | ChatCompletionUserMessageParam
    )[] = [systemMessage, ...userMessage];

    const agentCompletion: ChatCompletion =
      await this.openaiApiService.generateCompletion(completionMessages);

    const completionResponse: CompletionResponseDto = {
      messages: [
        ...messages,
        ...agentCompletion.choices.map(
          ({ message }) =>
            ({
              role: 'AGENT',
              content: message.content,
            }) as MessageDto,
        ),
      ],
      handoverToHumanNeeded: contextualContent.some(
        ({ type }) => type === 'N2',
      ),
      sectionsRetrieved: contextualContent,
    };

    return completionResponse;
  }

  private cleanRelatedTexts(relatedTexts: ClaudSearchResponse[]) {
    return relatedTexts[0].value.map(
      ({ ['@search.score']: score, content, type }) => ({
        score,
        content,
        type,
      }),
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
      this.claudIaService.searchEmbeddingsByProjectName(
        projectName,
        data[0].embedding,
      ),
    );

    return Promise.all(searchPromises);
  }

  private generateSystemMessage(
    context: string,
  ): ChatCompletionSystemMessageParam {
    return {
      role: 'system',
      content: this.systemPrompt + ' provided context: ' + context,
    };
  }

  private checkClarification(messages: MessageDto[]): boolean {
    if (messages.length < 2) return false;

    const lastTwo = messages.filter(({ role }) => role === 'AGENT').slice(-2);
    return lastTwo.every(
      ({ content }) =>
        content.toLowerCase() === this.noAnswerMessage.toLowerCase(),
    );
  }
}
