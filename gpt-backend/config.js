// Sequential AI Pipeline Configuration
module.exports = {
  // API Keys for different AI models
  apiKeys: {
    gpt4: process.env.GPT4_API_KEY || '',
    claude4: process.env.CLAUDE4_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || '',
    gpt4o: process.env.GPT4O_API_KEY || ''
  },

  // Pipeline Configuration
  pipeline: {
    maxPhases: parseInt(process.env.MAX_PIPELINE_PHASES) || 5,
    testTimeoutMs: parseInt(process.env.TEST_TIMEOUT_MS) || 30000,
    maxExecutionTimeMs: parseInt(process.env.MAX_EXECUTION_TIME_MS) || 120000,
    enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Model-specific configurations
  models: {
    gpt4: {
      baseURL: process.env.GPT4_BASE_URL || 'https://api.a4f.co/v1',
      model: process.env.GPT4_MODEL || 'provider-6/gpt-4.1',
      maxTokens: 2000,
      temperature: 0.1
    },
    claude4: {
      baseURL: process.env.CLAUDE4_BASE_URL || 'https://api.a4f.co/v1',
      model: process.env.CLAUDE4_MODEL || 'provider-6/r1-1776',
      maxTokens: 2000,
      temperature: 0.1
    },
    gemini: {
      baseURL: process.env.GEMINI_BASE_URL || 'https://api.a4f.co/v1',
      model: process.env.GEMINI_MODEL || 'provider-6/gemini-2.5-flash-thinking',
      maxTokens: 2000,
      temperature: 0.1
    },
    deepseek: {
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://openrouter.ai/api/v1',
      model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1-0528:free',
      maxTokens: 2000,
      temperature: 0.1
    },
    gpt4o: {
      baseURL: process.env.GPT4O_BASE_URL || 'https://api.a4f.co/v1',
      model: process.env.GPT4O_MODEL || 'provider-6/gpt-4.1-mini',
      maxTokens: 2000,
      temperature: 0.1
    }
  },

  // Phase configurations
  phases: {
    1: {
      name: 'Problem Analysis',
      models: ['gpt4', 'claude4'],
      logic: 'AND Gate',
      timeout: 15000
    },
    2: {
      name: 'First Solution Attempt',
      models: ['gpt4', 'claude4', 'gpt4o'],
      logic: 'Sequential',
      timeout: 20000
    },
    3: {
      name: 'Second Solution Attempt',
      models: ['claude4', 'gemini', 'gpt4o'],
      logic: 'Error Analysis',
      timeout: 25000
    },
    4: {
      name: 'Third Solution Attempt',
      models: ['gemini', 'deepseek', 'gpt4o'],
      logic: 'Error Analysis',
      timeout: 25000
    },
    5: {
      name: 'Final Solution Attempt',
      models: ['deepseek', 'gpt4', 'gpt4o'],
      logic: 'Final Attempt',
      timeout: 30000
    }
  }
}; 