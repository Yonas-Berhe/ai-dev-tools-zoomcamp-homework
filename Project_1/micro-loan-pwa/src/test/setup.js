import '@testing-library/jest-dom';

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          put: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(),
          delete: vi.fn(),
        })),
      })),
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  })),
};

global.indexedDB = indexedDB;

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {};
}
global.crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).substr(2, 9);

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
