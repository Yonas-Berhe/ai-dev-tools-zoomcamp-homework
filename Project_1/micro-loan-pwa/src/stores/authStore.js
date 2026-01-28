import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize auth state from stored token
  initAuth: async () => {
    if (!authAPI.isAuthenticated()) {
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          error: null 
        });
      } else {
        // Token invalid, clear it
        authAPI.logout();
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      authAPI.logout();
      set({ user: null, isAuthenticated: false, error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Register new user
  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(email, password, name);
      if (response.success) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          error: null 
        });
        return { success: true };
      } else {
        set({ error: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Login user
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          error: null 
        });
        return { success: true };
      } else {
        set({ error: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout user
  logout: () => {
    authAPI.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
