/**
 * Sandboxed Code Executor
 * Executes code safely in the browser using Web Workers and iframe isolation
 */

// Worker code as a string to be executed in a Web Worker
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
      // Only JavaScript execution in web worker
      if (language === 'javascript' || language === 'typescript') {
        // For TypeScript, we just execute as JavaScript (no type checking)
        const result = eval(code);
        
        // If there's a return value and no console logs, show the result
        if (result !== undefined && logs.length === 0) {
          logs.push({ type: 'success', content: formatValue(result) });
        }
      } else {
        logs.push({ 
          type: 'info', 
          content: 'Note: Only JavaScript can be executed in the browser. Other languages are shown for collaborative editing only.' 
        });
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
 * Execute code in a sandboxed environment
 * @param {string} code - The code to execute
 * @param {string} language - The programming language
 * @param {number} timeout - Execution timeout in milliseconds
 * @returns {Promise<Array>} Array of output lines
 */
export async function executeCode(code, language, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // For non-JavaScript languages, return a message
    if (language !== 'javascript' && language !== 'typescript') {
      resolve([
        {
          type: 'info',
          content: `Browser execution is only available for JavaScript.`,
        },
        {
          type: 'info',
          content: `For ${language} execution, you would need a backend execution service.`,
        },
        {
          type: 'log',
          content: `--- Your ${language} code ---`,
        },
        {
          type: 'log',
          content: code.substring(0, 500) + (code.length > 500 ? '...' : ''),
        },
      ]);
      return;
    }

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
