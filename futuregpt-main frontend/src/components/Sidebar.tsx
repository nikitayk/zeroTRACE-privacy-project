import { MessageSquare, Search, Code, Eye, Plus, Settings, Target, Trophy, BookOpen, Brain } from 'lucide-react';
import type { AppMode } from '../types';
import '../components/SidebarBackground.css';

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
  gamification: Trophy,
  study: BookOpen,
  'adaptive-learning': Brain,
};

const modeLabels = {
  chat: 'Chat',
  research: 'Research',
  code: 'Code',
  vision: 'Vision',
  'dsa-solver': 'DSA Solver',
  gamification: 'Gamification',
  study: 'Study Plan',
  'adaptive-learning': 'Adaptive Learning',
};

export function Sidebar({ mode, onModeChange, onNewChat }: SidebarProps) {
  return (
  <div className="w-16 flex flex-col items-center py-2 app-sidebar-overlay sidebar-container" style={{position: 'relative', overflow: 'hidden', height: '100vh', minHeight: '100vh', zIndex: 2}}>
  <div className="sidebar-content w-full flex flex-col items-center py-2">
        {/* New Chat */}
        <button
          onClick={onNewChat}
          className="sidebar-icon w-8 h-8 rounded-md border flex items-center justify-center text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF] transition-all duration-300 group"
          title="New Chat"
        >
          <Plus size={16} />
        </button>

        <div className="h-px w-8 my-2 divider" />

        {/* Mode Buttons */}
        <div className="w-full flex flex-col items-center gap-1">
          {(Object.keys(modeIcons) as AppMode[]).map((modeKey) => {
            const Icon = modeIcons[modeKey];
            const isActive = mode === modeKey;
            return (
              <button
                key={modeKey}
                onClick={() => onModeChange(modeKey)}
                className={`sidebar-icon w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-300 group ${
                  isActive
                    ? 'text-[#9A4DFF] active'
                    : 'text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF]'
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
          className="sidebar-icon w-8 h-8 mt-2 rounded-md border flex items-center justify-center text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF] transition-all duration-300 group"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}