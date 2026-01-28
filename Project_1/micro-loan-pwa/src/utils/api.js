/**
 * API Client Service
 * Handles all HTTP requests to the backend API
 * PRD Reference: Phase 3 - Cloud sync capabilities
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get stored auth token
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Set auth token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Make API request with automatic auth header
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle non-JSON responses (like CSV export)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.text();
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Request failed');
    error.code = data.error?.code;
    error.status = response.status;
    throw error;
  }
  
  return data;
}

// ==================
// AUTH API
// ==================

export const authAPI = {
  async register(email, password, name) {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },
  
  async login(email, password) {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },
  
  async getProfile() {
    return request('/auth/me');
  },
  
  logout() {
    setToken(null);
  },
  
  isAuthenticated() {
    return !!getToken();
  },
};

// ==================
// LOANS API
// ==================

export const loansAPI = {
  /**
   * Calculate loan (public - no auth required)
   */
  async calculate(loanData) {
    return request('/loans/calculate', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  },
  
  /**
   * Get user's loan history (auth required)
   */
  async getHistory(limit = 20, offset = 0) {
    return request(`/loans?limit=${limit}&offset=${offset}`);
  },
  
  /**
   * Save loan to history (auth required)
   */
  async save(loanData) {
    return request('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  },
  
  /**
   * Get specific loan (auth required)
   */
  async getById(id) {
    return request(`/loans/${id}`);
  },
  
  /**
   * Delete loan (auth required)
   */
  async delete(id) {
    return request(`/loans/${id}`, { method: 'DELETE' });
  },
};

// ==================
// SAVINGS API
// ==================

export const savingsAPI = {
  /**
   * Get all savings goals (auth required)
   */
  async getAll() {
    return request('/savings');
  },
  
  /**
   * Create savings goal (auth required)
   */
  async create(goalData) {
    return request('/savings', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },
  
  /**
   * Get specific goal (auth required)
   */
  async getById(id) {
    return request(`/savings/${id}`);
  },
  
  /**
   * Update goal (auth required)
   */
  async update(id, goalData) {
    return request(`/savings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },
  
  /**
   * Delete goal (auth required)
   */
  async delete(id) {
    return request(`/savings/${id}`, { method: 'DELETE' });
  },
  
  /**
   * Add transaction to goal (auth required)
   */
  async addTransaction(goalId, transactionData) {
    return request(`/savings/${goalId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
  
  /**
   * Export savings as CSV (auth required)
   */
  async exportCSV() {
    return request('/savings/export/csv');
  },
};

// ==================
// LESSONS API
// ==================

export const lessonsAPI = {
  /**
   * Get all lessons (public)
   */
  async getAll(language = 'en') {
    return request(`/lessons?language=${language}`);
  },
  
  /**
   * Get specific lesson (public)
   */
  async getById(id, language = 'en') {
    return request(`/lessons/${id}?language=${language}`);
  },
};

// ==================
// LENDERS API
// ==================

export const lendersAPI = {
  /**
   * Get all lenders (public)
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.minRating) params.append('minRating', filters.minRating);
    
    const query = params.toString();
    return request(`/lenders${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get lender details (public)
   */
  async getById(id) {
    return request(`/lenders/${id}`);
  },
};

// ==================
// SYNC API
// ==================

export const syncAPI = {
  /**
   * Sync offline data (auth required)
   */
  async sync(data) {
    return request('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default {
  auth: authAPI,
  loans: loansAPI,
  savings: savingsAPI,
  lessons: lessonsAPI,
  lenders: lendersAPI,
  sync: syncAPI,
};
