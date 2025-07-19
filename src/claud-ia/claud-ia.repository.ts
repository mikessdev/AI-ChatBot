import { InternalServerErrorException } from '@nestjs/common';
import { AzureSearchRequest } from './interface/azureSearchRequest-interface';
import { AzureSearchResponse } from './interface/azureSearchResponse-interface';

export class CloudIARepository {
  private readonly URL: string;
  private readonly API_KEY: string;

  constructor() {
    this.URL = process.env.BASE_ClAUDIA_URL || '';
    this.API_KEY = process.env.AZURE_AI_SEARCH_KEY || '';
  }

  async searchEmbeddings(
    azureSearchRequest: AzureSearchRequest,
  ): Promise<AzureSearchResponse> {
    const {
      count = true,
      select = 'content, type',
      top = 10,
      filter,
      vectorQueries,
    } = azureSearchRequest;

    const url: string = `${this.URL}/search?api-version=2023-11-01`;
    const body: AzureSearchRequest = {
      count,
      select,
      top,
      filter,
      vectorQueries,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure Search failed: ${response.status} ${error}`);
      }

      return await response.json();
    } catch (error) {
      throw new InternalServerErrorException(
        `Azure Search failed: ${error.message}`,
      );
    }
  }
}
