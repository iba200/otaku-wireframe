import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';
import type {
  User,
  Article,
  Topic,
  Reply,
  Comment,
  Category,
  AuthResponse,
  UserProfile,
  PaginatedResponse,
  ApiError
} from '@/types';

// Extend AxiosRequestConfig to include retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle different error types
    if (error.response?.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      });
    } else if (error.response?.status >= 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong on our end. Please try again later.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  refresh: async (): Promise<{ access_token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};

// Users API
export const usersApi = {
  getUsers: async (params?: { page?: number; per_page?: number; sort?: string; search?: string }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getUser: async (id: number): Promise<UserProfile> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data.user;
  },
  
  getLeaderboard: async (): Promise<User[]> => {
    const response = await api.get('/users/leaderboard');
    return response.data.users;
  },
};

// Articles API
export const articlesApi = {
  getArticles: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Article>> => {
    const response = await api.get('/articles', { params });
    return response.data;
  },
  
  getArticle: async (id: number): Promise<{ article: Article; comments: Comment[] }> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },
  
  createArticle: async (data: { title: string; content: string; category: string; excerpt?: string; image_url?: string }): Promise<Article> => {
    const response = await api.post('/articles', data);
    return response.data.article;
  },
  
  updateArticle: async (id: number, data: Partial<Article>): Promise<Article> => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data.article;
  },
  
  deleteArticle: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },
  
  likeArticle: async (id: number): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await api.post(`/articles/${id}/like`);
    return response.data;
  },
};

// Forum API
export const forumApi = {
  getTopics: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: string;
  }): Promise<{ topics: Topic[]; total: number; pages: number }> => {
    const response = await api.get('/forum/topics', { params });
    return response.data;
  },
  
  createTopic: async (data: { title: string; content: string; category: string }): Promise<Topic> => {
    const response = await api.post('/forum/topics', data);
    return response.data.topic;
  },
  
  getTopic: async (id: number): Promise<{ topic: Topic; replies: Reply[] }> => {
    const response = await api.get(`/forum/topics/${id}`);
    return response.data;
  },
  
  updateTopic: async (id: number, data: Partial<Topic>): Promise<Topic> => {
    const response = await api.put(`/forum/topics/${id}`, data);
    return response.data.topic;
  },
  
  deleteTopic: async (id: number): Promise<void> => {
    await api.delete(`/forum/topics/${id}`);
  },
  
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/forum/categories');
    return response.data.categories;
  },
  
  createReply: async (topicId: number, content: string): Promise<Reply> => {
    const response = await api.post(`/forum/topics/${topicId}/reply`, { content });
    return response.data.reply;
  },
};

// Comments API
export const commentsApi = {
  createComment: async (data: { content: string; article_id: number; parent_id?: number }): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data.comment;
  },
  
  getComment: async (id: number): Promise<Comment> => {
    const response = await api.get(`/comments/${id}`);
    return response.data.comment;
  },
  
  getArticleComments: async (articleId: number, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get(`/comments/article/${articleId}`, { params });
    return response.data;
  },
  
  replyToComment: async (id: number, content: string): Promise<Comment> => {
    const response = await api.post(`/comments/${id}/reply`, { content });
    return response.data.comment;
  },
  
  updateComment: async (id: number, content: string): Promise<Comment> => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data.comment;
  },
  
  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
  
  likeComment: async (id: number): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },
  
  moderateComment: async (id: number, action: 'hide' | 'restore' | 'flag'): Promise<void> => {
    await api.post(`/comments/${id}/moderate`, { action });
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;