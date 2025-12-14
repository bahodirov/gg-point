export interface BlogPost {
  id: string;
  title: string;
  titleUz?: string;
  slug: string;
  excerpt: string;
  excerptUz?: string;
  content: string;
  contentUz?: string;
  author: string;
  publishDate: Date;
  thumbnail: string;
  category: string;
  tags: string[];
  readTime: number; // in minutes
  pinned?: boolean;
  relatedPosts?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  nameUz?: string;
  slug: string;
}
