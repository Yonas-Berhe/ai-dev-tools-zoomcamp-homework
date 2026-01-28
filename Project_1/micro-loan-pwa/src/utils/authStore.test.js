/**
 * Auth Store Tests
 * Tests Zustand auth store functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// Mock the API module before importing the store
vi.mock('./api', () => ({
  authAPI: {
    isAuthenticated: vi.fn(),
    getProfile: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

import useAuthStore from '../stores/authStore';
import { authAPI } from './api';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('initAuth', () => {
    it('does nothing when no token exists', async () => {
      authAPI.isAuthenticated.mockReturnValue(false);

      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      expect(authAPI.getProfile).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('fetches profile when token exists', async () => {
      authAPI.isAuthenticated.mockReturnValue(true);
      authAPI.getProfile.mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'test@test.com', name: 'Test' } },
      });

      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      expect(authAPI.getProfile).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual({
        id: 1,
        email: 'test@test.com',
        name: 'Test',
      });
    });

    it('clears auth state when profile fetch fails', async () => {
      authAPI.isAuthenticated.mockReturnValue(true);
      authAPI.getProfile.mockResolvedValue({ success: false });

      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      expect(authAPI.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('register', () => {
    it('registers user successfully', async () => {
      authAPI.register.mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'new@test.com', name: 'New User' } },
      });

      let result;
      await act(async () => {
        result = await useAuthStore.getState().register('new@test.com', 'password', 'New User');
      });

      expect(result.success).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user.email).toBe('new@test.com');
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('handles registration failure', async () => {
      authAPI.register.mockResolvedValue({
        success: false,
        error: 'Email already exists',
      });

      let result;
      await act(async () => {
        result = await useAuthStore.getState().register('exists@test.com', 'password', 'Test');
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('Email already exists');
    });

    it('sets loading state during registration', async () => {
      let loadingDuringCall = false;
      authAPI.register.mockImplementation(async () => {
        loadingDuringCall = useAuthStore.getState().isLoading;
        return { success: true, data: { user: {} } };
      });

      await act(async () => {
        await useAuthStore.getState().register('test@test.com', 'password', 'Test');
      });

      expect(loadingDuringCall).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('logs in user successfully', async () => {
      authAPI.login.mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'test@test.com' } },
      });

      let result;
      await act(async () => {
        result = await useAuthStore.getState().login('test@test.com', 'password');
      });

      expect(result.success).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user.email).toBe('test@test.com');
    });

    it('handles login failure', async () => {
      authAPI.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      let result;
      await act(async () => {
        result = await useAuthStore.getState().login('test@test.com', 'wrong');
      });

      expect(result.success).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
    });

    it('handles network error', async () => {
      authAPI.login.mockRejectedValue(new Error('Network error'));

      let result;
      await act(async () => {
        result = await useAuthStore.getState().login('test@test.com', 'password');
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('logout', () => {
    it('clears user state', () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: { id: 1, email: 'test@test.com' },
        isAuthenticated: true,
      });

      act(() => {
        useAuthStore.getState().logout();
      });

      expect(authAPI.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      act(() => {
        useAuthStore.getState().clearError();
      });

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
