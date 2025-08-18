import React from 'react';
import { MessageCircle, Search, Code, Eye, Zap, Globe, Shield, Target, Users, TrendingUp } from 'lucide-react';
import type { AppMode } from '../types';

interface WelcomeScreenProps {
  mode: AppMode;
  hasApiKey: boolean;
}

const features = [
  {
    icon: MessageCircle,
    title: 'Context-Aware Chat',
    description: 'Analyzes webpage content and selected text for relevant responses'
  },
  {
    icon: Search,
    title: 'Web Search',
    description: 'Search the web for current information when context is insufficient'
  },
  {
    icon: Zap,
    title: 'Function Calling',
    description: 'Execute predefined functions like weather, bookmarks, and more'
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'All processing in-memory with zero data storage'
  },
  {
    icon: Code,
    title: 'Code Assistant',
    description: 'Get help with programming, debugging, and code explanations'
  },
  {
    icon: Eye,
    title: 'Vision Analysis',
    description: 'Analyze images and extract information from visual content'
  }
];

const competitiveFeatures = [
  {
    icon: Target,
    title: 'DSA Problem Solver',
    description: 'Solve complex algorithmic problems with optimal solutions'
  },
  {
    icon: Code,
    title: 'Multi-Language Support',
    description: 'C++, Python, Java, JavaScript with competitive programming templates'
  },
  {
    icon: TrendingUp,
    title: 'Complexity Analysis',
    description: 'Detailed time and space complexity analysis with optimizations'
  },
  {
    icon: Zap,
    title: 'Test Case Generation',
    description: 'Generate comprehensive test cases for edge case coverage'
  },
  {
    icon: Users,
    title: 'Interview Prep',
    description: 'Practice coding interviews with real-world problem scenarios'
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'All processing in-memory with zero data storage'
  }
];

const modeDescriptions = {
  chat: 'General conversation with context awareness',
  research: 'Deep analysis with structured research capabilities',
  code: 'Programming assistance with code generation and debugging',
  vision: 'Image analysis and visual content understanding',
  'dsa-solver': 'Solve complex DSA problems with optimal algorithms',
  competitive: 'Competitive programming with advanced problem solving',
  interview: 'Coding interview preparation and practice',
  optimization: 'Code optimization and performance analysis'
};

const competitiveExamples = [
  'Solve "Maximum Subarray Sum" with Kadane\'s Algorithm',
  'Implement Binary Search with edge case handling',
  'Dynamic Programming solution for "Longest Common Subsequence"',
  'Graph algorithms: DFS, BFS, Dijkstra implementation',
  'Advanced data structures: Trie, Segment Tree, Fenwick Tree'
];

export function WelcomeScreen({ mode, hasApiKey }: WelcomeScreenProps) {
  const isCompetitiveMode = mode === 'dsa-solver' || mode === 'competitive' || mode === 'interview' || mode === 'optimization';
  const currentFeatures = (isCompetitiveMode ? competitiveFeatures : features).slice(0, 4);
  const currentExamples = (isCompetitiveMode ? competitiveExamples : [
    "What's on this page?",
    "Search latest AI news",
    mode === 'code' ? "Write a React component" : null
  ]).filter(Boolean).slice(0, 2);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 text-center gap-3 bg-[#0D0D0D]">
      {/* Logo and Title */}
      <div className="mb-2">
        <div className="w-10 h-10 bg-[#2B0F45] rounded-2xl flex items-center justify-center mb-2 mx-auto border border-[#9A4DFF]">
          {isCompetitiveMode ? (
            <Target size={20} className="text-[#9A4DFF]" />
          ) : (
            <MessageCircle size={20} className="text-[#9A4DFF]" />
          )}
        </div>
        <h1 className="text-lg font-bold text-white mb-1">
          {isCompetitiveMode ? 'Ultimate DSA Solver' : 'zeroTrace AI'}
        </h1>
        <p className="text-[#B3B3B3] text-xs">
          {isCompetitiveMode ? 'World\'s Best Competitive Programming AI' : 'Privacy-First AI Assistant'}
        </p>
      </div>
      
      {/* Mode Description */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-full text-xs text-[#B3B3B3] mb-2">
          {mode === 'chat' && <MessageCircle size={14} />}
          {mode === 'research' && <Search size={14} />}
          {mode === 'code' && <Code size={14} />}
          {mode === 'vision' && <Eye size={14} />}
          {mode === 'dsa-solver' && <Target size={14} />}
          {mode === 'competitive' && <Zap size={14} />}
          {mode === 'interview' && <Users size={14} />}
          {mode === 'optimization' && <TrendingUp size={14} />}
          <span className="capitalize">{mode.replace('-', ' ')} Mode</span>
        </div>
        <p className="text-[#B3B3B3] text-xs max-w-xs">
          {modeDescriptions[mode]}
        </p>
      </div>

      {/* Compact Features Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2 w-full max-w-sm">
        {currentFeatures.map((feature, index) => (
          <div
            key={index}
            className="p-2 bg-[#1A1A1A] rounded-lg border border-[#2E2E2E]"
          >
            <feature.icon size={14} className="text-[#9A4DFF] mb-1 mx-auto" />
            <h3 className="text-[11px] font-medium text-white mb-0.5">{feature.title}</h3>
            <p className="text-[10px] text-[#B3B3B3] leading-tight">{feature.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}