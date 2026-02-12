const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Handle 401 responses by clearing invalid token
const handleUnauthorized = (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login?reason=session_expired';
  }
  return response;
};

export const api = {
  get: async (endpoint: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
    return handleUnauthorized(response);
  },

  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
    return handleUnauthorized(response);
  },
};
