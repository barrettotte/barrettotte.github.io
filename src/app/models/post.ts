export interface Post {
  id: number;
  title: string;
  description: string;
  date: string;
  url?: string;
  tags?: string[];
  pageSrc?: string;
  featured?: number;
}
