import { useState, useEffect, useCallback } from 'react';
import { AdaptiveLearningInterface } from '../adaptive_learning/learningInterface';
import { config } from '../adaptive_learning/config';
import { storageManager } from '../adaptive_learning/storage';

export interface AdaptiveLearningState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentDomain: string | null;
  currentSession: any | null;
  userAnalytics: any | null;
  userProgress: any | null;
}

export interface AdaptiveLearningActions {
  initialize: () => Promise<void>;
  selectDomain: (domainId: string) => Promise<any>;
  startSession: () => Promise<any>;
  submitAnswer: (questionId: string, answer: string, responseTime: number, confidence?: number) => Promise<any>;
  endSession: () => Promise<any>;
  getAnalytics: () => Promise<any>;
  exportData: () => Promise<any>;
  clearData: () => Promise<void>;
  updateAPIConfig: (baseUrl: string, apiKey: string, modelName?: string) => Promise<void>;
}

export function useAdaptiveLearning(userId: string = 'default_user') {
  const [state, setState] = useState<AdaptiveLearningState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    currentDomain: null,
    currentSession: null,
    userAnalytics: null,
    userProgress: null
  });

  const [learningInterface, setLearningInterface] = useState<AdaptiveLearningInterface | null>(null);

  // Initialize the adaptive learning system
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize storage
      await storageManager.initialize();
      
      // Load API configuration from storage
      const savedAPIConfig = await storageManager.loadAPIConfig();
      if (savedAPIConfig) {
        config.updateAPIConfig(
          savedAPIConfig.baseUrl,
          savedAPIConfig.apiKey,
          savedAPIConfig.modelName
        );
      }

      // Create and initialize learning interface
      const interface_ = new AdaptiveLearningInterface(userId);
      await interface_.initialize();

      setLearningInterface(interface_);
      
      // Load user progress
      const progress = await storageManager.getProgress(userId);
      if (progress) {
        setState(prev => ({ ...prev, userProgress: progress }));
      }
      
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isLoading: false,
        error: null 
      }));

      console.log('Adaptive learning system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize adaptive learning system:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Initialization failed' 
      }));
    }
  }, [userId]);

  // Select a learning domain
  const selectDomain = useCallback(async (domainId: string) => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await learningInterface.selectDomain(domainId);
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          currentDomain: domainId,
          isLoading: false 
        }));
      } else {
        throw new Error(result.error || 'Failed to select domain');
      }

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to select domain' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Start a learning session
  const startSession = useCallback(async () => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await learningInterface.startLearningSession();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          currentSession: result,
          isLoading: false 
        }));
      } else {
        throw new Error(result.error || 'Failed to start session');
      }

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start session' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Submit an answer
  const submitAnswer = useCallback(async (
    questionId: string, 
    answer: string, 
    responseTime: number, 
    confidence: number = 0.5
  ) => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await learningInterface.submitAnswer(questionId, answer, responseTime, confidence);
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          currentSession: result.feedback,
          isLoading: false 
        }));
      } else {
        throw new Error(result.error || 'Failed to submit answer');
      }

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to submit answer' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await learningInterface.endSession();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          currentSession: null,
          isLoading: false 
        }));
      } else {
        throw new Error(result.error || 'Failed to end session');
      }

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to end session' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Get user analytics
  const getAnalytics = useCallback(async () => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const analytics = await learningInterface.getUserAnalytics();
      
      setState(prev => ({ 
        ...prev, 
        userAnalytics: analytics,
        isLoading: false 
      }));

      return analytics;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to get analytics' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Export user data
  const exportData = useCallback(async () => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data = await learningInterface.exportUserData();
      
      setState(prev => ({ ...prev, isLoading: false }));

      return data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to export data' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Clear user data
  const clearData = useCallback(async () => {
    if (!learningInterface) {
      throw new Error('Learning interface not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await learningInterface.clearUserData();
      
      setState(prev => ({ 
        ...prev, 
        currentDomain: null,
        currentSession: null,
        userAnalytics: null,
        userProgress: null,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to clear data' 
      }));
      throw error;
    }
  }, [learningInterface]);

  // Update API configuration
  const updateAPIConfig = useCallback(async (baseUrl: string, apiKey: string, modelName?: string) => {
    try {
      config.updateAPIConfig(baseUrl, apiKey, modelName);
      
      // Save to storage
      await storageManager.saveAPIConfig({
        baseUrl,
        apiKey,
        modelName: modelName || config.apiConfig.modelName
      });
      
      setState(prev => ({ ...prev, error: null }));
    } catch (error) {
      console.error('Failed to update API config:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update API config' 
      }));
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const actions: AdaptiveLearningActions = {
    initialize,
    selectDomain,
    startSession,
    submitAnswer,
    endSession,
    getAnalytics,
    exportData,
    clearData,
    updateAPIConfig
  };

  return {
    ...state,
    ...actions,
    learningInterface
  };
}
