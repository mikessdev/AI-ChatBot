export interface AzureSearchMessage {
  role: 'USER' | 'AGENT';
  content: string;
}

export interface AzureSearchSection {
  score: number;
  content: string;
}

export interface AzureSearchResponse {
  messages: AzureSearchMessage[];
  handoverToHumanNeeded: boolean;
  sectionsRetrieved: AzureSearchSection[];
}
