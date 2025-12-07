/**
 * Tests for Code Executor Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeCode } from '../services/codeExecutor';

describe('Code Executor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute JavaScript code successfully', async () => {
    const promise = executeCode('console.log("Hello")', 'javascript', 5000);
    
    // Fast-forward timers
    vi.advanceTimersByTime(1000);
    
    const result = await promise;
    
    // Result should be an array
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return message for non-JavaScript languages', async () => {
    const result = await executeCode('print("Hello")', 'python');

    expect(result).toHaveLength(4);
    expect(result[0].type).toBe('info');
    expect(result[0].content).toContain('JavaScript');
  });

  it('should handle Go language', async () => {
    const code = `
      package main
      import "fmt"
      func main() { fmt.Println("Hello") }
    `;
    
    const result = await executeCode(code, 'go');

    expect(result.some(r => r.content.includes('go'))).toBe(true);
  });

  it('should handle Rust language', async () => {
    const code = 'fn main() { println!("Hello"); }';
    
    const result = await executeCode(code, 'rust');

    expect(result.some(r => r.content.includes('rust'))).toBe(true);
  });

  it('should handle Java language', async () => {
    const code = 'public class Main { public static void main(String[] args) {} }';
    
    const result = await executeCode(code, 'java');

    expect(result.some(r => r.content.includes('java') || r.content.includes('Java'))).toBe(true);
  });
});
