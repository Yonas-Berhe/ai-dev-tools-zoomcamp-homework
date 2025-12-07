import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: function MockEditor({ value, onChange, language }) {
    const React = require('react');
    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value: value,
      onChange: (e) => onChange && onChange(e.target.value),
      'data-language': language,
    });
  },
}));

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL for Web Worker tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Web Worker
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
  }
  postMessage(data) {
    // Simulate async response with proper output structure
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ 
          data: { 
            success: true, 
            output: [{ type: 'log', content: 'mock result' }] 
          } 
        });
      }
    }, 10);
  }
  terminate() {}
}
global.Worker = MockWorker;
