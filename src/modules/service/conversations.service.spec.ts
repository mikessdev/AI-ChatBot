//mocks
import firstSampleGenerateTextEmbeddings from '../test/mocks/1-sample-generate-text-embeddings.json';
import firstSampleGenerateCompletion from '../test/mocks/1-sample-generate-completion.json';
import firstSampleSearchEmbeddingsByProjectName from '../test/mocks/1-sample-search-Embeddings-by-project-name.json';
import secondSampleSearchEmbeddingsByProjectName from '../test/mocks/2-sample-search-Embeddings-by-project-name.json';
import firstSampleRequest from '../test/mocks/1-sample-request.json';
import thirdSampleRequest from '../test/mocks/3-sample-request.json';
//

import { ConversationsService } from './conversations.service';
import { OpenaiApiService } from './openai-api.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ChatCompletion,
  CreateEmbeddingResponse,
} from 'openai/resources/index';
import { CloudIAService } from './claud-ia.service';
import { ClaudSearchResponse } from '../interface/claudSearchResponse-interface';
import { CompletionRequestDto } from '../dto/completion-request.dto';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let claudIaServiceMock: CloudIAService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: OpenaiApiService,
          useValue: {
            generateCompletion: jest
              .fn()
              .mockResolvedValue(
                firstSampleGenerateCompletion as ChatCompletion,
              ),
            generateTextEmbeddings: jest
              .fn()
              .mockResolvedValue(
                firstSampleGenerateTextEmbeddings as CreateEmbeddingResponse,
              ),
          },
        },
        {
          provide: CloudIAService,
          useValue: {
            searchEmbeddingsByProjectName: jest
              .fn()
              .mockResolvedValue(
                firstSampleSearchEmbeddingsByProjectName as ClaudSearchResponse,
              ),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    claudIaServiceMock = module.get<CloudIAService>(CloudIAService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a completion with the AI answer based only on the provided context', async () => {
    const result = await service.generateCompletion(
      firstSampleRequest as CompletionRequestDto,
    );

    expect(result).toHaveProperty('messages');
    expect(result.messages[result.messages.length - 1].role).toBe('AGENT');
    expect(result.handoverToHumanNeeded).toBe(false);
    expect(result.sectionsRetrieved.length).toBeGreaterThan(0);
  });

  it('The AI can make up to 2 clarifications per conversation. If a 3rd is needed, it should inform the user that the ticket will be escalated to a human specialist and set handoverToHumanNeeded: true in the response', async () => {
    const result = await service.generateCompletion(
      thirdSampleRequest as CompletionRequestDto,
    );

    expect(result.handoverToHumanNeeded).toBe(true);
    expect(result.messages[result.messages.length - 1].role).toBe('AGENT');
    expect(result.messages[result.messages.length - 1].content).toBe(
      service.answerRedirectForHuman,
    );
  });

  it('should Automatic escalation for N2 content', async () => {
    jest
      .spyOn(claudIaServiceMock, 'searchEmbeddingsByProjectName')
      .mockResolvedValue(
        secondSampleSearchEmbeddingsByProjectName as ClaudSearchResponse,
      );

    const result = await service.generateCompletion(
      firstSampleRequest as CompletionRequestDto,
    );

    expect(result.handoverToHumanNeeded).toBe(true);
    expect(result.messages[result.messages.length - 1].role).toBe('AGENT');
    expect(result.messages[result.messages.length - 1].content).not.toBe(
      service.answerRedirectForHuman,
    );
  });
});
