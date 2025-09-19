// Storage Manager for Adaptive Learning System
// Uses chrome.storage.local for privacy-first data persistence

export interface StorageData {
  userModels: Record<string, any>;
  interactionHistory: any[];
  learningSessions: any[];
  achievements: any[];
  progress: Record<string, any>;
  settings: Record<string, any>;
  contentCache: Record<string, any>;
  lastUpdated: string;
}

export class StorageManager {
  private static instance: StorageManager;
  private storageKey = 'adaptive_learning_data';
  private maxStorageSize = 50 * 1024 * 1024; // 50MB limit
  private maxHistoryItems = 1000; // Max interaction history items

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Initialize storage with default structure
  async initialize(): Promise<void> {
    try {
      const existing = await this.getData();
      if (!existing) {
        const defaultData: StorageData = {
          userModels: {},
          interactionHistory: [],
          learningSessions: [],
          achievements: [],
          progress: {},
          settings: {},
          contentCache: {},
          lastUpdated: new Date().toISOString()
        };
        await this.setData(defaultData);
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  // Get all data from storage
  async getData(): Promise<StorageData | null> {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      return result[this.storageKey] || null;
    } catch (error) {
      console.error('Failed to get data from storage:', error);
      return null;
    }
  }

  // Set all data to storage
  async setData(data: StorageData): Promise<void> {
    try {
      data.lastUpdated = new Date().toISOString();
      await chrome.storage.local.set({ [this.storageKey]: data });
    } catch (error) {
      console.error('Failed to set data to storage:', error);
      throw error;
    }
  }

  // API Configuration methods
  async saveAPIConfig(apiConfig: any): Promise<void> {
    try {
      await chrome.storage.local.set({ 'adaptive_learning_api_config': apiConfig });
    } catch (error) {
      console.error('Error saving API config:', error);
      throw error;
    }
  }

  async loadAPIConfig(): Promise<any | null> {
    try {
      const result = await chrome.storage.local.get(['adaptive_learning_api_config']);
      return result.adaptive_learning_api_config || null;
    } catch (error) {
      console.error('Error loading API config:', error);
      return null;
    }
  }

  // Get specific user model
  async getUserModel(userId: string): Promise<any | null> {
    try {
      const data = await this.getData();
      return data?.userModels[userId] || null;
    } catch (error) {
      console.error('Failed to get user model:', error);
      return null;
    }
  }

  // Save user model
  async saveUserModel(userId: string, userModel: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          newData.userModels[userId] = userModel;
          await this.setData(newData);
        }
      } else {
        data.userModels[userId] = userModel;
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to save user model:', error);
      throw error;
    }
  }

  // Add interaction to history
  async addInteraction(interaction: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          newData.interactionHistory.push(interaction);
          // Limit history size
          if (newData.interactionHistory.length > this.maxHistoryItems) {
            newData.interactionHistory = newData.interactionHistory.slice(-this.maxHistoryItems);
          }
          await this.setData(newData);
        }
      } else {
        data.interactionHistory.push(interaction);
        // Limit history size
        if (data.interactionHistory.length > this.maxHistoryItems) {
          data.interactionHistory = data.interactionHistory.slice(-this.maxHistoryItems);
        }
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to add interaction:', error);
      throw error;
    }
  }

  // Get interaction history
  async getInteractionHistory(userId?: string, limit?: number): Promise<any[]> {
    try {
      const data = await this.getData();
      if (!data) return [];

      let history = data.interactionHistory;
      
      // Filter by user if specified
      if (userId) {
        history = history.filter(interaction => interaction.userId === userId);
      }

      // Apply limit
      if (limit) {
        history = history.slice(-limit);
      }

      return history;
    } catch (error) {
      console.error('Failed to get interaction history:', error);
      return [];
    }
  }

  // Save learning session
  async saveLearningSession(session: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          newData.learningSessions.push(session);
          await this.setData(newData);
        }
      } else {
        data.learningSessions.push(session);
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to save learning session:', error);
      throw error;
    }
  }

  // Get learning sessions
  async getLearningSessions(userId?: string, limit?: number): Promise<any[]> {
    try {
      const data = await this.getData();
      if (!data) return [];

      let sessions = data.learningSessions;
      
      // Filter by user if specified
      if (userId) {
        sessions = sessions.filter(session => session.userId === userId);
      }

      // Apply limit
      if (limit) {
        sessions = sessions.slice(-limit);
      }

      return sessions;
    } catch (error) {
      console.error('Failed to get learning sessions:', error);
      return [];
    }
  }

  // Add achievement
  async addAchievement(achievement: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          newData.achievements.push(achievement);
          await this.setData(newData);
        }
      } else {
        data.achievements.push(achievement);
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to add achievement:', error);
      throw error;
    }
  }

  // Get achievements
  async getAchievements(userId?: string): Promise<any[]> {
    try {
      const data = await this.getData();
      if (!data) return [];

      let achievements = data.achievements;
      
      // Filter by user if specified
      if (userId) {
        achievements = achievements.filter(achievement => achievement.userId === userId);
      }

      return achievements;
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  // Update progress
  async updateProgress(userId: string, domainId: string, progress: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          if (!newData.progress[userId]) {
            newData.progress[userId] = {};
          }
          newData.progress[userId][domainId] = progress;
          await this.setData(newData);
        }
      } else {
        if (!data.progress[userId]) {
          data.progress[userId] = {};
        }
        data.progress[userId][domainId] = progress;
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  }

  // Get progress
  async getProgress(userId: string, domainId?: string): Promise<any> {
    try {
      const data = await this.getData();
      if (!data || !data.progress[userId]) return null;

      if (domainId) {
        return data.progress[userId][domainId] || null;
      }
      return data.progress[userId];
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }

  // Cache content
  async cacheContent(key: string, content: any): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) {
        await this.initialize();
        const newData = await this.getData();
        if (newData) {
          newData.contentCache[key] = {
            content,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          };
          await this.setData(newData);
        }
      } else {
        data.contentCache[key] = {
          content,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to cache content:', error);
      throw error;
    }
  }

  // Get cached content
  async getCachedContent(key: string): Promise<any | null> {
    try {
      const data = await this.getData();
      if (!data || !data.contentCache[key]) return null;

      const cached = data.contentCache[key];
      const now = new Date();
      const expiresAt = new Date(cached.expiresAt);

      if (now > expiresAt) {
        // Content expired, remove it
        delete data.contentCache[key];
        await this.setData(data);
        return null;
      }

      return cached.content;
    } catch (error) {
      console.error('Failed to get cached content:', error);
      return null;
    }
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) return;

      const now = new Date();
      let hasChanges = false;

      Object.keys(data.contentCache).forEach(key => {
        const cached = data.contentCache[key];
        const expiresAt = new Date(cached.expiresAt);
        
        if (now > expiresAt) {
          delete data.contentCache[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        await this.setData(data);
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; total: number; percentage: number }> {
    try {
      const data = await this.getData();
      if (!data) return { used: 0, total: this.maxStorageSize, percentage: 0 };

      const dataString = JSON.stringify(data);
      const used = new Blob([dataString]).size;
      const percentage = (used / this.maxStorageSize) * 100;

      return {
        used,
        total: this.maxStorageSize,
        percentage
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, total: this.maxStorageSize, percentage: 0 };
    }
  }

  // Export all data (for GDPR compliance)
  async exportData(userId?: string): Promise<any> {
    try {
      const data = await this.getData();
      if (!data) return null;

      if (userId) {
        // Export only user-specific data
        return {
          userModel: data.userModels[userId] || null,
          interactionHistory: data.interactionHistory.filter(i => i.userId === userId),
          learningSessions: data.learningSessions.filter(s => s.userId === userId),
          achievements: data.achievements.filter(a => a.userId === userId),
          progress: data.progress[userId] || {},
          exportedAt: new Date().toISOString()
        };
      }

      // Export all data
      return {
        ...data,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  // Clear all data (for privacy compliance)
  async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.storageKey);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  // Clear user data
  async clearUserData(userId: string): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) return;

      // Remove user-specific data
      delete data.userModels[userId];
      delete data.progress[userId];
      
      // Filter out user interactions and sessions
      data.interactionHistory = data.interactionHistory.filter(i => i.userId !== userId);
      data.learningSessions = data.learningSessions.filter(s => s.userId !== userId);
      data.achievements = data.achievements.filter(a => a.userId !== userId);

      await this.setData(data);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw error;
    }
  }

  // Backup data
  async backupData(): Promise<string> {
    try {
      const data = await this.getData();
      if (!data) return '';

      const backup = {
        ...data,
        backupCreatedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(backup);
    } catch (error) {
      console.error('Failed to backup data:', error);
      return '';
    }
  }

  // Restore data from backup
  async restoreData(backupString: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupString);
      
      // Validate backup structure
      if (!backup.userModels || !backup.interactionHistory) {
        throw new Error('Invalid backup format');
      }

      await this.setData(backup);
      return true;
    } catch (error) {
      console.error('Failed to restore data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();
