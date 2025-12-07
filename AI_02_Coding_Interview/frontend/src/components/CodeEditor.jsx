import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
};

export default function CodeEditor({ code, language, onChange, isLocalChange }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 16 },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      renderWhitespace: 'selection',
      bracketPairColorization: {
        enabled: true,
      },
    });

    // Set dark theme
    monaco.editor.setTheme('vs-dark');
  };

  // Handle incoming code changes from other users
  useEffect(() => {
    if (editorRef.current && !isLocalChange.current) {
      const editor = editorRef.current;
      const currentPosition = editor.getPosition();
      
      // Update editor content
      const model = editor.getModel();
      if (model && model.getValue() !== code) {
        // Preserve cursor position during external updates
        editor.executeEdits('remote-update', [
          {
            range: model.getFullModelRange(),
            text: code,
          },
        ]);

        // Try to restore cursor position
        if (currentPosition) {
          editor.setPosition(currentPosition);
        }
      }
    }
  }, [code, isLocalChange]);

  const handleChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || 'javascript'}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-editor-bg">
            <div className="spinner" />
          </div>
        }
      />
    </div>
  );
}
