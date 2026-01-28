/**
 * API Client Tests
 * Tests API service methods and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authAPI, loansAPI, savingsAPI, lessonsAPI } from './api';

// Helper to create mock fetch response with headers
const createMockResponse = (data, ok = true) => ({
  ok,
  headers: {
    get: (name) => name === 'content-type' ? 'application/json' : null,
  },
  json: () => Promise.resolve(data),
});

describe('authAPI', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAuthenticated', () => {
    it('returns false when no token exists', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authAPI.isAuthenticated()).toBe(false);
    });

    it('returns true when token exists', () => {
      localStorage.getItem.mockReturnValue('test-token');
      expect(authAPI.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('removes token from localStorage', () => {
      authAPI.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('register', () => {
    it('makes POST request with user data', async () => {
      const mockResponse = {
        success: true,
        data: { user: { id: 1, email: 'test@test.com' }, token: 'test-token' },
      };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.register('test@test.com', 'password', 'Test User');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password',
            name: 'Test User',
          }),
        })
      );
      expect(result.success).toBe(true);
    });

    it('stores token on successful registration', async () => {
      const mockResponse = {
        success: true,
        data: { user: { id: 1 }, token: 'new-token' },
      };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await authAPI.register('test@test.com', 'password', 'Test');

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    });
  });

  describe('login', () => {
    it('makes POST request with credentials', async () => {
      const mockResponse = {
        success: true,
        data: { user: { id: 1 }, token: 'auth-token' },
      };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await authAPI.login('test@test.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password',
          }),
        })
      );
    });

    it('handles login failure', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ success: false, error: { message: 'Invalid credentials' } }, false));

      await expect(authAPI.login('test@test.com', 'wrong-password')).rejects.toThrow();
    });
  });
});

describe('loansAPI', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.getItem.mockReturnValue('test-token');
  });

  describe('calculate', () => {
    it('makes POST request with loan data', async () => {
      const mockResponse = { success: true, data: { monthlyPayment: 100 } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const loanData = {
        principal: 1000,
        interest_rate: 10,
        term_length: 12,
        term_unit: 'months',
        interest_type: 'reducing',
      };

      await loansAPI.calculate(loanData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/loans/calculate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(loanData),
        })
      );
    });
  });

  describe('getHistory', () => {
    it('makes authenticated GET request', async () => {
      const mockResponse = { success: true, data: { loans: [] } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await loansAPI.getHistory();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/loans'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('save', () => {
    it('makes authenticated POST request', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const loanData = { principal: 1000, interest_rate: 10 };
      await loansAPI.save(loanData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/loans'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('delete', () => {
    it('makes authenticated DELETE request', async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await loansAPI.delete(123);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/loans/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});

describe('savingsAPI', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.getItem.mockReturnValue('test-token');
  });

  describe('getAll', () => {
    it('fetches all savings goals', async () => {
      const mockResponse = { success: true, data: { goals: [] } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await savingsAPI.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/savings'),
        expect.any(Object)
      );
    });
  });

  describe('create', () => {
    it('creates new savings goal', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const goalData = { name: 'Emergency Fund', target_amount: 5000 };
      await savingsAPI.create(goalData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/savings'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(goalData),
        })
      );
    });
  });

  describe('addTransaction', () => {
    it('adds transaction to goal', async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await savingsAPI.addTransaction(1, { amount: 100, description: 'Deposit' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/savings/1/transactions'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});

describe('lessonsAPI', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('fetches all lessons', async () => {
      const mockResponse = { success: true, data: { lessons: [] } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await lessonsAPI.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lessons'),
        expect.any(Object)
      );
    });
  });

  describe('getById', () => {
    it('fetches single lesson', async () => {
      const mockResponse = { success: true, data: { lesson: {} } };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await lessonsAPI.getById('interest-types');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lessons/interest-types'),
        expect.any(Object)
      );
    });
  });
});

describe('Error handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it('handles network errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(authAPI.login('test@test.com', 'password')).rejects.toThrow('Network error');
  });

  it('handles server errors', async () => {
    global.fetch.mockResolvedValueOnce(createMockResponse({ success: false, error: { message: 'Internal server error' } }, false));

    await expect(authAPI.login('test@test.com', 'password')).rejects.toThrow();
  });
});
