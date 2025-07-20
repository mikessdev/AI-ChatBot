import { InternalServerErrorException } from '@nestjs/common';
import { ClaudSearchRequest } from './interface/claudSearchRequest-interface';
import { ClaudSearchResponse } from './interface/claudSearchResponse-interface';

export class CloudIARepository {
  private readonly URL: string;
  private readonly HEADERS: Record<string, string>;

  constructor() {
    this.URL = process.env.BASE_ClAUDIA_URL || '';
    this.HEADERS = {
      'Content-Type': 'application/json',
      'api-key': process.env.CLAUD_API_KEY || '',
    };
  }

  async GetFromVectorApi(
    azureSearchRequest: ClaudSearchRequest,
  ): Promise<ClaudSearchResponse> {
    const url: string = `${this.URL}/search?api-version=2023-11-01`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.HEADERS,
        body: JSON.stringify(azureSearchRequest),
      });

      return await response.json();
    } catch (error) {
      throw new InternalServerErrorException(
        `Claud vector api failed: ${error.message}`,
      );
    }
  }
}
