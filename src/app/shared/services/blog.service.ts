import { Injectable, signal } from '@angular/core';
import { BlogPost, BlogCategory } from '../models/blog.model';
import blogData from '../../../assets/data/blog-posts.json';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private postsSignal = signal<BlogPost[]>([]);
  private categoriesSignal = signal<BlogCategory[]>([]);

  posts = this.postsSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();

  constructor() {
    this.loadPosts();
  }

  private loadPosts(): void {
    if (typeof window !== 'undefined' || blogData) {
      const posts = (blogData as any).posts || [];
      this.postsSignal.set(posts);
      this.extractCategories(posts);
    }
  }

  private extractCategories(posts: BlogPost[]): void {
    const categorySet = new Set<string>();
    posts.forEach(post => categorySet.add(post.category));

    const categories: BlogCategory[] = Array.from(categorySet).map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-')
    }));

    this.categoriesSignal.set(categories);
  }

  getPostBySlug(slug: string): BlogPost | undefined {
    return this.postsSignal().find(p => p.slug === slug);
  }

  getPostsByCategory(category: string): BlogPost[] {
    return this.postsSignal().filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  getPinnedPosts(): BlogPost[] {
    return this.postsSignal().filter(p => p.pinned);
  }

  getRecentPosts(limit: number = 3): BlogPost[] {
    return this.postsSignal()
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limit);
  }

  searchPosts(query: string): BlogPost[] {
    const lowerQuery = query.toLowerCase();
    return this.postsSignal().filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.excerpt.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getRelatedPosts(postId: string, limit: number = 3): BlogPost[] {
    const post = this.postsSignal().find(p => p.id === postId);
    if (!post) return [];

    // Get posts from the same category or with similar tags
    return this.postsSignal()
      .filter(p => 
        p.id !== postId && 
        (p.category === post.category || 
         p.tags.some(tag => post.tags.includes(tag)))
      )
      .slice(0, limit);
  }
}
