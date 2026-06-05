import { apiClient } from './client';

export const chatApi = {
  send: (message: string, conversationId?: string) =>
    apiClient.post<{ reply: string }>('/chat', { message, conversationId }),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: any }>('/auth/login', { email, password }),
  register: (email: string, password: string, username: string) =>
    apiClient.post<{ token: string; user: any }>('/auth/register', { email, password, username }),
  logout: () => apiClient.post('/auth/logout'),
};

export const conversationsApi = {
  getAll: () => apiClient.get('/conversations'),
  create: (title: string) => apiClient.post('/conversations', { title }),
  delete: (id: string) => apiClient.delete(`/conversations/${id}`),
};

export const projectsApi = {
  getAll: () => apiClient.get('/projects'),
  create: (title: string, description?: string) => apiClient.post('/projects', { title, description }),
  update: (id: string, data: any) => apiClient.patch(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};
