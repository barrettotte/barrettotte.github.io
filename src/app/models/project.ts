export interface Project {
  id: number;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  pageSrc?: string;
  featured?: number;
}
