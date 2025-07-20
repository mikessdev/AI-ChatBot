import { Injectable } from '@nestjs/common';
import { CloudIARepository } from './claud-ia.repository';
import { AzureSearchRequest } from './interface/azureSearchRequest-interface';
import { AzureSearchResponse } from './interface/azureSearchResponse-interface';

@Injectable()
export class CloudIAService {
  constructor(private readonly repository: CloudIARepository) {}

  async searchEmbeddingsByProjectName(
    projectName: string,
    embeddings: number[],
  ): Promise<AzureSearchResponse> {
    const queryEmbedding: AzureSearchRequest = this.buildEmbeddingQuery(
      projectName,
      embeddings,
    );

    return await this.repository.GetFromVectorApi(queryEmbedding);
  }

  private buildEmbeddingQuery(
    projectName: string,
    embeddings: number[],
  ): AzureSearchRequest {
    const azureSearchRequest: AzureSearchRequest = {
      count: true,
      select: 'content, type',
      top: 10,
      filter: `projectName eq '${projectName}'`,
      vectorQueries: [
        { vector: embeddings, k: 3, fields: 'embeddings', kind: 'vector' },
      ],
    };

    return azureSearchRequest;
  }
}
