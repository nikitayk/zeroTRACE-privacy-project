import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { config } from '../adaptive_learning/config';

interface AdaptiveLearningConfigProps {
  onConfigSaved: () => void;
  onBack: () => void;
}

export function AdaptiveLearningConfig({ onConfigSaved, onBack }: AdaptiveLearningConfigProps) {
  const [apiConfig, setApiConfig] = useState({
    baseUrl: '',
    apiKey: '',
    modelName: 'gpt-3.5-turbo'
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing config
    const loadConfig = () => {
      setApiConfig({
        baseUrl: config.apiConfig.baseUrl || '',
        apiKey: config.apiConfig.apiKey || '',
        modelName: config.apiConfig.modelName || 'gpt-3.5-turbo'
      });
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      // Update global config
      config.updateAPIConfig(apiConfig.baseUrl, apiConfig.apiKey, apiConfig.modelName);
      
      // Save to chrome.storage.local
      await chrome.storage.local.set({
        adaptive_learning_config: {
          apiConfig: apiConfig,
          timestamp: new Date().toISOString()
        }
      });

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onConfigSaved();
      }, 2000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setValidationResult({
        success: false,
        message: 'Failed to save configuration'
      });
    }
  };

  const validateConnection = async () => {
    if (!apiConfig.baseUrl || !apiConfig.apiKey) {
      setValidationResult({
        success: false,
        message: 'Please provide both API URL and API Key'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: apiConfig.modelName,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a connection test.'
            }
          ],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setValidationResult({
          success: true,
          message: 'Connection successful! API is working correctly.'
        });
      } else {
        const errorText = await response.text();
        setValidationResult({
          success: false,
          message: `Connection failed: ${response.status} - ${errorText}`
        });
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getProviderInfo = (baseUrl: string) => {
    if (baseUrl.includes('openai.com')) {
      return {
        name: 'OpenAI',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
        color: 'from-green-500 to-green-700'
      };
    } else if (baseUrl.includes('anthropic.com')) {
      return {
        name: 'Anthropic Claude',
        models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        color: 'from-orange-500 to-orange-700'
      };
    } else if (baseUrl.includes('generativelanguage.googleapis.com')) {
      return {
        name: 'Google Gemini',
        models: ['gemini-pro', 'gemini-pro-vision'],
        color: 'from-blue-500 to-blue-700'
      };
    } else {
      return {
        name: 'Custom Provider',
        models: ['gpt-3.5-turbo', 'gpt-4', 'custom-model'],
        color: 'from-purple-500 to-purple-700'
      };
    }
  };

  const providerInfo = getProviderInfo(apiConfig.baseUrl);

  return (
    <div className="h-full bg-[#0A0A0A] text-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <Settings className="w-4 h-4 mr-2" />
          Back to Settings
        </button>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Adaptive Learning Configuration
        </h1>
        <p className="text-gray-400 text-lg">
          Configure AI providers and settings for personalized learning
        </p>
      </div>

      {/* Configuration Form */}
      <div className="max-w-2xl space-y-6">
        {/* Provider Selection */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            AI Provider Configuration
          </h3>
          
          <div className="space-y-4">
            {/* Provider Info */}
            <div className={`p-4 rounded-lg bg-gradient-to-r ${providerInfo.color} text-white`}>
              <div className="font-semibold">{providerInfo.name}</div>
              <div className="text-sm opacity-90">Detected from API URL</div>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Base URL
              </label>
              <input
                type="url"
                value={apiConfig.baseUrl}
                onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: https://api.openai.com/v1, https://api.anthropic.com/v1
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors pr-12"
                />
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your API key is stored locally and never shared
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={apiConfig.modelName}
                onChange={(e) => setApiConfig(prev => ({ ...prev, modelName: e.target.value }))}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                {providerInfo.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Connection Test</h3>
          
          <button
            onClick={validateConnection}
            disabled={isValidating || !apiConfig.baseUrl || !apiConfig.apiKey}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          {validationResult && (
            <div className={`mt-4 p-4 rounded-lg flex items-center ${
              validationResult.success 
                ? 'bg-green-900/20 border border-green-500 text-green-300' 
                : 'bg-red-900/20 border border-red-500 text-red-300'
            }`}>
              {validationResult.success ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {validationResult.message}
            </div>
          )}
        </div>

        {/* Quick Setup Guides */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Quick Setup Guides</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">OpenAI</h4>
              <p className="text-sm text-gray-400 mb-2">
                URL: https://api.openai.com/v1<br/>
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAI Platform</a>
              </p>
            </div>

            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-2">Anthropic Claude</h4>
              <p className="text-sm text-gray-400 mb-2">
                URL: https://api.anthropic.com/v1<br/>
                Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Anthropic Console</a>
              </p>
            </div>

            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Google Gemini</h4>
              <p className="text-sm text-gray-400 mb-2">
                URL: https://generativelanguage.googleapis.com/v1beta<br/>
                Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!apiConfig.baseUrl || !apiConfig.apiKey}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg border border-gray-700">
        <h4 className="font-semibold text-yellow-400 mb-2">Privacy & Security</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Your API key is stored locally in your browser and never sent to our servers</li>
          <li>• All learning data is processed locally and stored in chrome.storage.local</li>
          <li>• No personal data is collected or shared with third parties</li>
          <li>• You can export or delete your data at any time</li>
        </ul>
      </div>
    </div>
  );
}
