import React from 'react';
import { Logo } from './Logo';
import type { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  model: string;
  credits: number;
}

const modeDescriptions = {
  chat: 'Chat with AI',
  research: 'Deep Research',
  code: 'Code Assistant',
  vision: 'Vision Analysis',
  'dsa-solver': 'DSA Problem Solver',
  competitive: 'Competitive Programming',
  interview: 'Interview Prep',
  optimization: 'Code Optimization',
};

export function Header({ mode, model, credits }: HeaderProps) {
  const [backendOnline, setBackendOnline] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3000/health', { method: 'GET' });
        if (!cancelled) setBackendOnline(res.ok);
      } catch {
        if (!cancelled) setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="h-12 bg-gray-950/80 border-b border-gray-800/50 px-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Logo size="sm" />
        <div>
          <h1 className="text-xs font-medium text-white/90">{modeDescriptions[mode]}</h1>
          <p className="text-[10px] text-gray-500">{model}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${backendOnline ? 'bg-green-400' : 'bg-gray-700'}`} />
          <span className="hidden sm:inline">{backendOnline ? 'Backend Connected' : 'Backend Offline'}</span>
        </div>
        <span className="text-green-400 font-medium">{credits}</span>
        <span>credits</span>
      </div>
    </div>
  );
}