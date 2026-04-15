export interface SavedProjectDTO {
  id: string;
  userId: string;
  name: string;
  url: string;
  homepageUrl: string;
  description: string;
  tech: string[];
  embeddingDimensions: number | null;
  hasEmbedding: boolean;
  createdAt: string;
  updatedAt: string;
}
