import React from 'react';
import { MessageCircle, Search, Code, Eye, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onExampleClick: (example: string) => void;
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
    icon: Code,
    title: 'Code Assistant',
    description: 'Get help with programming, debugging, and code explanations'
  },
  {
    icon: Eye,
    title: 'Vision Analysis',
    description: 'Analyze images and extract information from visual content'
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'All processing in-memory with zero data storage'
  }
];

// Imported types and constants

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const currentFeatures = features.slice(0, 4);
  const examples = [
    "What's on this page?",
    "Help me study DSA",
    "Explain time complexity",
    "Create a study plan"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 text-center gap-3" style={{background: 'transparent'}}>
      {/* Logo and Title */}
      <div className="mb-2">
        <div className="w-10 h-10 bg-[#2B0F45] rounded-2xl flex items-center justify-center mb-2 mx-auto border border-[#9A4DFF]">
          <MessageCircle size={20} className="text-[#9A4DFF]" />
        </div>
        <h1 className="text-lg font-bold text-white mb-1">
          zeroTrace AI
        </h1>
        <p className="text-[#B3B3B3] text-xs">
          Privacy-First AI Assistant
        </p>
      </div>
      
      {/* Welcome Message */}
      <div className="mb-2">
        <h2 className="text-white text-lg mb-2">Welcome to zeroTrace AI</h2>
        <p className="text-[#B3B3B3] text-sm max-w-xs mb-4">
          Your personal AI assistant for learning and mastering Data Structures & Algorithms
        </p>
        
        {/* Example Prompts */}
        <div className="flex flex-col gap-2">
          <p className="text-[#B3B3B3] text-xs">Try these examples:</p>
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => onExampleClick(example)}
              className="text-[#9A4DFF] text-sm hover:text-[#B37FFF] transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Features Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2 w-full max-w-sm">
        {currentFeatures.map((feature, index) => (
          <div
            key={index}
            className="feature-card p-2 rounded-lg"
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