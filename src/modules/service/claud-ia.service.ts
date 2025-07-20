import { Injectable } from '@nestjs/common';
import { CloudIARepository } from '../repository/claud-ia.repository';
import { ClaudSearchRequest } from '../interface/claudSearchRequest-interface';
import { ClaudSearchResponse } from '../interface/claudSearchResponse-interface';

@Injectable()
export class CloudIAService {
  constructor(private readonly repository: CloudIARepository) {}

  async searchEmbeddingsByProjectName(
    projectName: string,
    embeddings: number[],
  ): Promise<ClaudSearchResponse> {
    const queryEmbedding: ClaudSearchRequest = this.buildEmbeddingQuery(
      projectName,
      embeddings,
    );

    return await this.repository.GetFromVectorApi(queryEmbedding);
  }

  private buildEmbeddingQuery(
    projectName: string,
    embeddings: number[],
  ): ClaudSearchRequest {
    const azureSearchRequest: ClaudSearchRequest = {
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
