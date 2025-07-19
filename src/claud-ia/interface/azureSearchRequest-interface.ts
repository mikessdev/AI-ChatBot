export interface VectorQuery {
  vector: number[];
  k: number;
  fields: string;
  kind: 'vector';
}

export interface AzureSearchRequest {
  count?: boolean;
  select?: string;
  top?: number;
  filter: string;
  vectorQueries: VectorQuery[];
}
