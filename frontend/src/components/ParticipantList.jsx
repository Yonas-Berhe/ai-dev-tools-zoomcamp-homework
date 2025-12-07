import { Users, User } from 'lucide-react';

// Generate consistent colors for participants
const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#A8D8EA', // Light Blue
];

function getParticipantColor(index) {
  return COLORS[index % COLORS.length];
}

export default function ParticipantList({ participants, currentUserId }) {
  return (
    <aside className="w-64 bg-editor-sidebar border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Participants ({participants.length})
        </h2>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-2">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No participants yet
          </p>
        ) : (
          <ul className="space-y-1">
            {participants.map((participant, index) => (
              <ParticipantItem
                key={participant.id}
                participant={participant}
                isCurrentUser={participant.id === currentUserId}
                color={getParticipantColor(index)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer - connection status */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Share the link to invite others
        </p>
      </div>
    </aside>
  );
}

function ParticipantItem({ participant, isCurrentUser, color }) {
  return (
    <li
      className={`participant-enter flex items-center gap-3 p-2 rounded-md ${
        isCurrentUser ? 'bg-primary-600/20' : 'hover:bg-gray-700/50'
      }`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
        style={{ backgroundColor: color }}
      >
        {participant.name?.charAt(0).toUpperCase() || '?'}
      </div>

      {/* Name and status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          {participant.name || 'Anonymous'}
          {isCurrentUser && (
            <span className="text-xs text-gray-400 ml-1">(you)</span>
          )}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span
            className={`w-2 h-2 rounded-full ${
              participant.isActive ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />
          {participant.isActive ? 'Active' : 'Away'}
        </p>
      </div>

      {/* User icon */}
      <User className="w-4 h-4 text-gray-500" />
    </li>
  );
}
