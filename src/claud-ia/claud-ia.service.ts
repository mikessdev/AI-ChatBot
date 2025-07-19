import { Injectable } from '@nestjs/common';
import { CloudIARepository } from './claud-ia.repository';
import { AzureSearchRequest } from './interface/azureSearchRequest-interface';
import { AzureSearchResponse } from './interface/azureSearchResponse-interface';

@Injectable()
export class CloudIAService {
  constructor(private readonly repository: CloudIARepository) {}

  async searchEmbeddings(
    projectName: string,
    embeddings: number[],
  ): Promise<AzureSearchResponse> {
    const azureSearchRequest: AzureSearchRequest = {
      filter: `projectName eq '\''${projectName}'\''`,
      vectorQueries: [
        { k: 10, fields: 'content', kind: 'vector', vector: embeddings },
      ],
    };

    return await this.repository.searchEmbeddings(azureSearchRequest);
  }
}
