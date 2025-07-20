export interface ClaudSearchResult {
  '@search.score': number;
  content: string;
  type: string;
}

export interface ClaudSearchResponse {
  '@odata.context': string;
  '@odata.count': number;
  value: ClaudSearchResult[];
}
