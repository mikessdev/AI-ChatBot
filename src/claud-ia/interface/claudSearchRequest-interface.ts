export interface VectorQuery {
  vector: number[];
  k: number;
  fields: string;
  kind: string;
}

export interface ClaudSearchRequest {
  count?: boolean;
  select?: string;
  top?: number;
  filter: string;
  vectorQueries: VectorQuery[];
}
