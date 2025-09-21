export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  cover_image_url?: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  is_active: boolean;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  user_liked: boolean;
  image_url?: string;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  author: User;
  created_at: string;
  updated_at: string;
  last_reply?: {
    author: User;
    created_at: string;
  };
}

export interface Reply {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
  topic_id: number;
}

export interface Comment {
  id: number;
  content: string;
  likes: number;
  user_liked: boolean;
  author: User;
  created_at: string;
  updated_at: string;
  article_id: number;
  parent_id?: number;
  replies: Comment[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  topics_count: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface UserStats {
  articles_count: number;
  topics_count: number;
  comments_count: number;
  likes_received: number;
}

export interface UserProfile {
  user: User;
  recent_articles: Article[];
  recent_topics: Topic[];
  stats: UserStats;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}