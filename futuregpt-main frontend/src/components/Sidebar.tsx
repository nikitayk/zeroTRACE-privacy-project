import { MessageSquare, Search, Code, Eye, Plus, Settings, Target, Zap, Users, TrendingUp } from 'lucide-react';
import type { AppMode } from '../types';

interface SidebarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
}

const modeIcons = {
  chat: MessageSquare,
  research: Search,
  code: Code,
  vision: Eye,
  'dsa-solver': Target,
  competitive: Zap,
  interview: Users,
  optimization: TrendingUp,
};

const modeLabels = {
  chat: 'Chat',
  research: 'Research',
  code: 'Code',
  vision: 'Vision',
  'dsa-solver': 'DSA Solver',
  competitive: 'Competitive',
  interview: 'Interview',
  optimization: 'Optimize',
};

export function Sidebar({ mode, onModeChange, onNewChat }: SidebarProps) {
  return (
    <div className="w-16 bg-gray-900/60 border-l border-gray-800/60 flex flex-col items-center py-2">
      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="w-8 h-8 rounded-md bg-gray-800/60 border border-gray-700/40 flex items-center justify-center text-gray-200 hover:text-green-400 hover:border-green-400/40 hover:bg-gray-700/60 transition-all duration-200 group"
        title="New Chat"
      >
        <Plus size={16} />
      </button>

      <div className="h-px w-8 bg-gray-700/50 my-2" />

      {/* Mode Buttons */}
      <div className="w-full flex flex-col items-center gap-1">
        {(Object.keys(modeIcons) as AppMode[]).map((modeKey) => {
          const Icon = modeIcons[modeKey];
          const isActive = mode === modeKey;
          
          return (
            <button
              key={modeKey}
              onClick={() => onModeChange(modeKey)}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'bg-green-500/20 border-green-400/50 text-green-400 shadow-sm shadow-green-500/10'
                  : 'bg-gray-800/60 border-gray-700/40 text-gray-200 hover:text-green-400 hover:border-green-400/40 hover:bg-gray-700/60'
              }`}
              title={modeLabels[modeKey]}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <button
        className="w-8 h-8 mt-2 rounded-md bg-gray-800/60 border border-gray-700/40 flex items-center justify-center text-gray-200 hover:text-green-400 hover:border-green-400/40 hover:bg-gray-700/60 transition-all duration-200 group"
        title="Settings"
      >
        <Settings size={14} />
      </button>
    </div>
  );
}