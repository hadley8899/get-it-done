export interface KnowledgebaseCategory {
  uuid: string;
  name: string;
  description: string;
  parent: KnowledgebaseCategory | null;
  position: number;
  created_at: string;
  updated_at: string;
}
