import {
  Play,
  Link,
  LogOut,
  Code2,
  Check,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

export default function Toolbar({
  sessionTitle,
  language,
  onLanguageChange,
  onRun,
  isExecuting,
  onCopyLink,
  onLeave,
  connected,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-editor-sidebar border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section - Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary-500" />
            <span className="font-semibold text-white hidden sm:block">
              CodeInterview
            </span>
          </div>

          <div className="h-6 w-px bg-gray-600 hidden sm:block" />

          <span className="text-gray-300 text-sm truncate max-w-[200px]">
            {sessionTitle || 'Interview Session'}
          </span>

          {/* Connection status */}
          <div
            className={`flex items-center gap-1 text-xs ${
              connected ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Center section - Language selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400 hidden sm:block">
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Run button */}
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <div className="spinner w-4 h-4" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Run</span>
              </>
            )}
          </button>

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary text-sm px-3 py-1.5 flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Leave button */}
          <button
            onClick={onLeave}
            className="btn btn-danger text-sm px-3 py-1.5 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>
    </header>
  );
}
