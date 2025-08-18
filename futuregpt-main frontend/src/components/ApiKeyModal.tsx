import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
}

export function ApiKeyModal({ 
  isOpen, 
  onClose, 
  currentApiKey, 
  onSaveApiKey, 
  onClearApiKey 
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    // Here you would validate the API key
    setTimeout(() => {
      onSaveApiKey(apiKey.trim());
      setIsValidating(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    onClearApiKey();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[#2E2E2E]">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-[#9A4DFF]" />
            <h2 className="font-semibold text-white">OpenAI API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-[#2B0F45] border border-[#9A4DFF] rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-[#9A4DFF] mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-white font-medium mb-1">Privacy Notice</p>
                <p className="text-[#B3B3B3]">
                  Your API key is stored locally in your browser and never sent to our servers. 
                  It's only used to communicate directly with OpenAI's API.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 pr-10 text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#9A4DFF] focus:bg-[#1A1A1A]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="text-xs text-[#B3B3B3]">
            <p>Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#9A4DFF] hover:underline">platform.openai.com/api-keys</a></p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-[#2E2E2E]">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 text-sm text-[#B3B3B3] hover:text-white border border-[#2E2E2E] rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            Clear Key
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || isValidating}
            className="flex-1 px-4 py-2 text-sm bg-[#2B0F45] text-white border border-[#9A4DFF] rounded-lg hover:bg-[#6A0DAD] transition-colors disabled:opacity-50 disabled:hover:bg-[#2B0F45] flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-3 h-3 border border-[#9A4DFF] border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Check size={14} />
                Save Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}