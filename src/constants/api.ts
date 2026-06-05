export const API_PATHS = {
  CHAT: '/api/chat',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  CONVERSATIONS: '/api/conversations',
  PROJECTS: '/api/projects',
  FILES: '/api/files',
  MEMORY: '/api/memory',
  ADMIN_USERS: '/api/admin/users',
} as const;

export const API_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
