import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import Toolbar from '../components/Toolbar';
import ParticipantList from '../components/ParticipantList';
import OutputPanel from '../components/OutputPanel';
import socketService from '../services/socket';
import api from '../services/api';
import { executeCode } from '../services/codeExecutor';

export default function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [output, setOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [userName, setUserName] = useState('');
  const isLocalChange = useRef(false);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await api.getSession(sessionId);
        setSession(sessionData);
        setCode(sessionData.code);
        setLanguage(sessionData.language);
        setLoading(false);
      } catch (err) {
        setError('Session not found or has expired');
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Setup socket connection
  useEffect(() => {
    if (!session || showNamePrompt) return;

    const socket = socketService.connect();

    // Socket event handlers
    socketService.on('connect', () => {
      setConnected(true);
      socketService.joinRoom(sessionId, userName || 'Anonymous');
    });

    socketService.on('disconnect', () => {
      setConnected(false);
    });

    socketService.on('room-joined', (data) => {
      setCurrentUser(data.participant);
      setParticipants(data.participants);
      setCode(data.session.code);
      setLanguage(data.session.language);
    });

    socketService.on('participant-joined', (data) => {
      setParticipants(data.participants);
    });

    socketService.on('participant-left', (data) => {
      setParticipants(data.participants);
    });

    socketService.on('code-update', (data) => {
      isLocalChange.current = false;
      setCode(data.code);
    });

    socketService.on('language-update', (data) => {
      setLanguage(data.language);
      if (data.code) {
        isLocalChange.current = false;
        setCode(data.code);
      }
    });

    socketService.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.type === 'SESSION_NOT_FOUND') {
        setError('Session not found');
      }
    });

    // Join room if already connected
    if (socket.connected) {
      setConnected(true);
      socketService.joinRoom(sessionId, userName || 'Anonymous');
    }

    return () => {
      socketService.leaveRoom(sessionId);
      socketService.removeAllListeners();
    };
  }, [session, sessionId, userName, showNamePrompt]);

  // Handle code changes
  const handleCodeChange = useCallback(
    (newCode) => {
      isLocalChange.current = true;
      setCode(newCode);
      socketService.sendCodeChange(sessionId, newCode);
    },
    [sessionId]
  );

  // Handle language changes
  const handleLanguageChange = useCallback(
    (newLanguage) => {
      setLanguage(newLanguage);
      socketService.sendLanguageChange(sessionId, newLanguage);
    },
    [sessionId]
  );

  // Handle code execution
  const handleRunCode = useCallback(async () => {
    setIsExecuting(true);
    setOutput([{ type: 'info', content: 'Executing code...' }]);

    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (err) {
      setOutput([{ type: 'error', content: `Execution error: ${err.message}` }]);
    } finally {
      setIsExecuting(false);
    }
  }, [code, language]);

  // Handle copy link
  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/interview/${sessionId}`;
    navigator.clipboard.writeText(link);
  }, [sessionId]);

  // Handle leave session
  const handleLeave = useCallback(() => {
    socketService.leaveRoom(sessionId);
    navigate('/');
  }, [sessionId, navigate]);

  // Handle name submit
  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNamePrompt(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="card p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Session Not Found
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Name prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">
            Join Interview Session
          </h2>
          <p className="text-gray-400 mb-6">
            {session?.title || 'Interview Session'}
          </p>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        sessionTitle={session?.title}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunCode}
        isExecuting={isExecuting}
        onCopyLink={handleCopyLink}
        onLeave={handleLeave}
        connected={connected}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              isLocalChange={isLocalChange}
            />
          </div>

          {/* Output Panel */}
          <OutputPanel output={output} isExecuting={isExecuting} />
        </div>

        {/* Sidebar - Participants */}
        <ParticipantList
          participants={participants}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
}
