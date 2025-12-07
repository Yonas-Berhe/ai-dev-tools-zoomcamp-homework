import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Link, Play, Globe } from 'lucide-react';
import api from '../services/api';

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

export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript',
    createdBy: '',
  });
  const [joinSessionId, setJoinSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await api.createSession(formData);
      navigate(`/interview/${session.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (joinSessionId.trim()) {
      // Extract session ID from URL if full URL is pasted
      let sessionId = joinSessionId.trim();
      if (sessionId.includes('/interview/')) {
        sessionId = sessionId.split('/interview/').pop();
      }
      navigate(`/interview/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-white">CodeInterview</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Real-time Collaborative
            <span className="text-primary-500"> Coding Interviews</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Conduct technical interviews with live code sharing, syntax
            highlighting, and instant code execution.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Real-time Collaboration"
            description="Code together in real-time with instant synchronization"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Execution"
            description="Run code directly in the browser with sandboxed execution"
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="Multiple Languages"
            description="Support for JavaScript, Python, Java, C++, and more"
          />
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Session Card */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary-500" />
              Start New Interview
            </h2>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Title (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Senior Developer Interview"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., John Interviewer"
                  value={formData.createdBy}
                  onChange={(e) =>
                    setFormData({ ...formData, createdBy: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Language
                </label>
                <select
                  className="input"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Create Interview Session
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join Session Card */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Link className="w-6 h-6 text-primary-500" />
              Join Existing Interview
            </h2>

            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Link or Session ID
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Paste the interview link or session ID"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!joinSessionId.trim()}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Link className="w-5 h-5" />
                Join Interview
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                How it works
              </h3>
              <ol className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center">
                    1
                  </span>
                  <span>Create a new interview session</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center">
                    2
                  </span>
                  <span>Share the link with your candidate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center">
                    3
                  </span>
                  <span>Code together in real-time</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>© 2024 CodeInterview. Built for better technical interviews.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 text-primary-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
