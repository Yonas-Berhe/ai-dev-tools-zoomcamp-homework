import { Terminal, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function OutputPanel({ output, isExecuting }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [outputLines, setOutputLines] = useState(output);

  // Update output lines when output prop changes
  if (output !== outputLines && output.length > 0) {
    setOutputLines(output);
  }

  const clearOutput = () => {
    setOutputLines([]);
  };

  return (
    <div
      className={`bg-editor-sidebar border-t border-gray-700 flex flex-col transition-all duration-200 ${
        isExpanded ? 'h-48' : 'h-10'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-700/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Output</span>
          {isExecuting && (
            <span className="text-xs text-yellow-400 animate-pulse">
              Running...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && outputLines.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearOutput();
              }}
              className="p-1 hover:bg-gray-600 rounded"
              title="Clear output"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Output content */}
      {isExpanded && (
        <div className="flex-1 overflow-auto p-4 output-panel bg-gray-900/50">
          {outputLines.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Click "Run" to execute the code. Output will appear here.
            </p>
          ) : (
            <div className="space-y-1">
              {outputLines.map((line, index) => (
                <OutputLine key={index} {...line} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OutputLine({ type, content }) {
  const getClassName = () => {
    switch (type) {
      case 'error':
        return 'output-error';
      case 'success':
        return 'output-success';
      case 'info':
        return 'output-info';
      case 'warn':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const getPrefix = () => {
    switch (type) {
      case 'error':
        return '❌ ';
      case 'success':
        return '✓ ';
      case 'info':
        return 'ℹ ';
      case 'warn':
        return '⚠ ';
      default:
        return '';
    }
  };

  return (
    <pre className={`${getClassName()} whitespace-pre-wrap break-words`}>
      {getPrefix()}
      {content}
    </pre>
  );
}
