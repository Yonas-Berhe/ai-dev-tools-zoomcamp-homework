/**
 * Sandboxed Code Executor
 * Executes code safely in the browser using:
 * - Web Workers for JavaScript (sandboxed execution)
 * - Pyodide (Python compiled to WebAssembly) for Python
 * 
 * NO server-side execution - all code runs in the browser for security
 */

// Pyodide instance (lazy loaded)
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideLoadPromise = null;

/**
 * Load Pyodide (Python WASM runtime) - lazy loaded on first Python execution
 */
async function loadPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }
  
  if (pyodideLoading) {
    return pyodideLoadPromise;
  }
  
  pyodideLoading = true;
  pyodideLoadPromise = (async () => {
    try {
      // Load Pyodide from CDN
      const { loadPyodide: loadPyodideModule } = await import('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.mjs');
      pyodideInstance = await loadPyodideModule({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
      
      // Set up stdout/stderr capture
      await pyodideInstance.runPythonAsync(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []
    
    def write(self, text):
        if text.strip():
            self.outputs.append(text)
    
    def flush(self):
        pass
    
    def get_outputs(self):
        return self.outputs
    
    def clear(self):
        self.outputs = []

_stdout_capture = OutputCapture()
_stderr_capture = OutputCapture()
      `);
      
      return pyodideInstance;
    } catch (error) {
      pyodideLoading = false;
      pyodideInstance = null;
      throw error;
    }
  })();
  
  return pyodideLoadPromise;
}

/**
 * Execute Python code using Pyodide (WASM)
 */
async function executePython(code, timeout = 10000) {
  const logs = [];
  
  try {
    logs.push({ type: 'info', content: '🐍 Loading Python WASM runtime...' });
    
    const pyodide = await Promise.race([
      loadPyodide(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Pyodide load timeout')), 30000)
      )
    ]);
    
    logs.pop(); // Remove loading message
    
    // Capture stdout/stderr
    await pyodide.runPythonAsync(`
_stdout_capture.clear()
_stderr_capture.clear()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
    `);
    
    // Execute user code with timeout
    const executePromise = pyodide.runPythonAsync(code);
    const result = await Promise.race([
      executePromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
    
    // Get captured output
    const stdout = await pyodide.runPythonAsync('_stdout_capture.get_outputs()');
    const stderr = await pyodide.runPythonAsync('_stderr_capture.get_outputs()');
    
    // Restore stdout/stderr
    await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);
    
    // Add stdout to logs
    const stdoutArray = stdout.toJs();
    for (const line of stdoutArray) {
      logs.push({ type: 'log', content: line });
    }
    
    // Add stderr to logs
    const stderrArray = stderr.toJs();
    for (const line of stderrArray) {
      logs.push({ type: 'error', content: line });
    }
    
    // If there's a return value and no output, show it
    if (result !== undefined && result !== null && logs.length === 0) {
      const resultStr = result.toString ? result.toString() : String(result);
      if (resultStr !== 'None' && resultStr !== 'undefined') {
        logs.push({ type: 'success', content: resultStr });
      }
    }
    
    if (logs.length === 0) {
      logs.push({ type: 'success', content: 'Code executed successfully (no output)' });
    }
    
    return logs;
  } catch (error) {
    logs.push({ type: 'error', content: `Python Error: ${error.message}` });
    return logs;
  }
}

// JavaScript Worker code as a string
const workerCode = `
  self.onmessage = function(e) {
    const { code, language } = e.data;
    
    // Capture console output
    const logs = [];
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    console.log = (...args) => {
      logs.push({ type: 'log', content: args.map(formatValue).join(' ') });
    };
    console.error = (...args) => {
      logs.push({ type: 'error', content: args.map(formatValue).join(' ') });
    };
    console.warn = (...args) => {
      logs.push({ type: 'warn', content: args.map(formatValue).join(' ') });
    };
    console.info = (...args) => {
      logs.push({ type: 'info', content: args.map(formatValue).join(' ') });
    };
    
    function formatValue(val) {
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      if (typeof val === 'object') {
        try {
          return JSON.stringify(val, null, 2);
        } catch (e) {
          return String(val);
        }
      }
      return String(val);
    }
    
    try {
      const result = eval(code);
      
      if (result !== undefined && logs.length === 0) {
        logs.push({ type: 'success', content: formatValue(result) });
      }
      
      self.postMessage({ success: true, output: logs });
    } catch (error) {
      logs.push({ type: 'error', content: error.toString() });
      self.postMessage({ success: false, output: logs });
    }
    
    // Restore console
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
`;

// Create a blob URL for the worker
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

/**
 * Execute code in a sandboxed environment (browser-only, no server execution)
 * 
 * Supported languages:
 * - JavaScript/TypeScript: Web Workers (sandboxed)
 * - Python: Pyodide (Python compiled to WebAssembly)
 * 
 * @param {string} code - The code to execute
 * @param {string} language - The programming language
 * @param {number} timeout - Execution timeout in milliseconds
 * @returns {Promise<Array>} Array of output lines
 */
export async function executeCode(code, language, timeout = 5000) {
  // Python execution via Pyodide (WASM)
  if (language === 'python') {
    return executePython(code, timeout);
  }
  
  // JavaScript/TypeScript execution via Web Workers
  if (language === 'javascript' || language === 'typescript') {
    return executeJavaScript(code, timeout);
  }
  
  // Other languages - not executable in browser
  return [
    {
      type: 'info',
      content: `⚠️ Browser execution is available for JavaScript and Python only.`,
    },
    {
      type: 'info',
      content: `${language.charAt(0).toUpperCase() + language.slice(1)} code is shown for collaborative editing.`,
    },
    {
      type: 'log',
      content: `--- Your ${language} code ---`,
    },
    {
      type: 'log',
      content: code.substring(0, 500) + (code.length > 500 ? '...' : ''),
    },
  ];
}

/**
 * Execute JavaScript code in a Web Worker
 */
function executeJavaScript(code, timeout = 5000) {
  return new Promise((resolve, reject) => {
    let worker = null;
    let timeoutId = null;

    try {
      // Create a new worker for each execution
      worker = new Worker(workerUrl);

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (worker) {
          worker.terminate();
          resolve([
            {
              type: 'error',
              content: `Execution timed out after ${timeout / 1000} seconds`,
            },
          ]);
        }
      }, timeout);

      // Handle worker messages
      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        worker.terminate();
        
        const { success, output } = e.data;
        
        if (success && output.length === 0) {
          resolve([{ type: 'success', content: 'Code executed successfully (no output)' }]);
        } else {
          resolve(output);
        }
      };

      // Handle worker errors
      worker.onerror = (error) => {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve([
          {
            type: 'error',
            content: `Worker error: ${error.message || 'Unknown error'}`,
          },
        ]);
      };

      // Send code to worker
      worker.postMessage({ code, language });
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (worker) worker.terminate();
      
      resolve([
        {
          type: 'error',
          content: `Failed to execute code: ${error.message}`,
        },
      ]);
    }
  });
}

/**
 * Execute code using an iframe sandbox (alternative method)
 * This provides additional isolation but has different limitations
 */
export async function executeCodeInIframe(code, language) {
  return new Promise((resolve) => {
    if (language !== 'javascript' && language !== 'typescript') {
      resolve([
        {
          type: 'info',
          content: `Browser execution is only available for JavaScript.`,
        },
      ]);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    document.body.appendChild(iframe);

    const logs = [];

    // Wrap code to capture output
    const wrappedCode = `
      <script>
        const logs = [];
        console.log = (...args) => logs.push({ type: 'log', content: args.join(' ') });
        console.error = (...args) => logs.push({ type: 'error', content: args.join(' ') });
        
        try {
          ${code}
          parent.postMessage({ type: 'result', logs }, '*');
        } catch (e) {
          logs.push({ type: 'error', content: e.toString() });
          parent.postMessage({ type: 'result', logs }, '*');
        }
      </script>
    `;

    const handleMessage = (event) => {
      if (event.data && event.data.type === 'result') {
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(iframe);
        resolve(event.data.logs);
      }
    };

    window.addEventListener('message', handleMessage);

    // Set timeout for iframe execution
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      resolve([{ type: 'error', content: 'Execution timed out' }]);
    }, 5000);

    iframe.srcdoc = wrappedCode;
  });
}

// Clean up worker URL on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('unload', () => {
    URL.revokeObjectURL(workerUrl);
  });
}
