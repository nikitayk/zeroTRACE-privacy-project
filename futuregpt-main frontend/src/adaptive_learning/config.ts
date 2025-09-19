// Adaptive Learning Configuration
export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface LearningDomainConfig {
  domainId: string;
  displayName: string;
  description: string;
  topics: string[];
  difficultyLevels: string[];
  assessmentTypes: string[];
}

export interface UserModelingConfig {
  modelUpdateFrequency: number;
  featureDimensions: number;
  learningRate: number;
  batchSize: number;
  epochs: number;
  validationSplit: number;
}

export interface ReinforcementLearningConfig {
  algorithm: string;
  explorationRate: number;
  learningRate: number;
  gamma: number;
  updateFrequency: number;
  maxEpisodeLength: number;
}

export interface AssessmentConfig {
  minQuestionsPerTopic: number;
  maxQuestionsPerSession: number;
  adaptiveThreshold: number;
  masteryThreshold: number;
  timeWeight: number;
  difficultyAdjustmentRate: number;
}

export interface GamificationConfig {
  pointsPerCorrectAnswer: number;
  bonusStreakMultiplier: number;
  dailyGoalBonus: number;
  levelUpThreshold: number;
  achievementThresholds: Record<string, number>;
}

export class AdaptiveLearningConfig {
  private static instance: AdaptiveLearningConfig;
  
  public apiConfig: APIConfig = {
    baseUrl: 'https://api.a4f.co/v',
    apiKey: 'ddc-a4f-caee73746e914d3bb457fe535b7dd9a8',
    modelName: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000
  };

  public userModeling: UserModelingConfig = {
    modelUpdateFrequency: 10,
    featureDimensions: 50,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    validationSplit: 0.2
  };

  public reinforcementLearning: ReinforcementLearningConfig = {
    algorithm: 'PPO',
    explorationRate: 0.1,
    learningRate: 0.0003,
    gamma: 0.99,
    updateFrequency: 5,
    maxEpisodeLength: 100
  };

  public assessmentConfig: AssessmentConfig = {
    minQuestionsPerTopic: 5,
    maxQuestionsPerSession: 20,
    adaptiveThreshold: 0.7,
    masteryThreshold: 0.85,
    timeWeight: 0.3,
    difficultyAdjustmentRate: 0.1
  };

  public gamificationConfig: GamificationConfig = {
    pointsPerCorrectAnswer: 10,
    bonusStreakMultiplier: 1.5,
    dailyGoalBonus: 50,
    levelUpThreshold: 1000,
    achievementThresholds: {
      firstSteps: 1,
      streakWarrior: 7,
      dedicatedLearner: 30,
      topicMaster: 1,
      domainExpert: 1
    }
  };

  // Learning domains configuration
  public learningDomains: Record<string, LearningDomainConfig> = {
    dsa_programming: {
      domainId: 'dsa_programming',
      displayName: 'Data Structures & Algorithms',
      description: 'Master coding interviews and competitive programming',
      topics: [
        'arrays', 'linked_lists', 'trees', 'graphs', 'dynamic_programming',
        'greedy', 'backtracking', 'sorting', 'searching', 'system_design'
      ],
      difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
      assessmentTypes: ['mcq', 'subjective', 'practical', 'case_study']
    },
    upsc_preparation: {
      domainId: 'upsc_preparation',
      displayName: 'UPSC Civil Services',
      description: 'Comprehensive preparation for UPSC examinations',
      topics: [
        'indian_polity', 'geography', 'history', 'economics', 'current_affairs',
        'ethics', 'international_relations', 'science_technology', 'environment', 'essay_writing'
      ],
      difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
      assessmentTypes: ['mcq', 'subjective', 'practical', 'case_study']
    },
    jee_preparation: {
      domainId: 'jee_preparation',
      displayName: 'JEE (Joint Entrance Examination)',
      description: 'Engineering entrance exam preparation',
      topics: [
        'physics_mechanics', 'physics_waves', 'chemistry_organic', 'chemistry_inorganic',
        'mathematics_calculus', 'mathematics_algebra', 'coordinate_geometry', 'trigonometry'
      ],
      difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
      assessmentTypes: ['mcq', 'subjective', 'practical', 'case_study']
    },
    developer_skills: {
      domainId: 'developer_skills',
      displayName: 'Software Development',
      description: 'Modern software development skills and technologies',
      topics: [
        'frontend_development', 'backend_development', 'mobile_development', 'devops',
        'cloud_computing', 'databases', 'api_design', 'testing', 'security', 'ai_ml_integration'
      ],
      difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
      assessmentTypes: ['mcq', 'subjective', 'practical', 'case_study']
    }
  };

  private constructor() {}

  public static getInstance(): AdaptiveLearningConfig {
    if (!AdaptiveLearningConfig.instance) {
      AdaptiveLearningConfig.instance = new AdaptiveLearningConfig();
    }
    return AdaptiveLearningConfig.instance;
  }

  updateAPIConfig(baseUrl: string, apiKey: string, modelName?: string): void {
    this.apiConfig.baseUrl = baseUrl;
    this.apiConfig.apiKey = apiKey;
    if (modelName) {
      this.apiConfig.modelName = modelName;
    }
  }

  getDomainConfig(domainId: string): LearningDomainConfig | undefined {
    return this.learningDomains[domainId];
  }

  toDict(): Record<string, any> {
    return {
      apiConfig: this.apiConfig,
      userModeling: this.userModeling,
      reinforcementLearning: this.reinforcementLearning,
      assessmentConfig: this.assessmentConfig,
      gamificationConfig: this.gamificationConfig
    };
  }

  static fromDict(data: Record<string, any>): AdaptiveLearningConfig {
    const config = AdaptiveLearningConfig.getInstance();
    
    if (data.apiConfig) {
      config.apiConfig = { ...config.apiConfig, ...data.apiConfig };
    }
    if (data.userModeling) {
      config.userModeling = { ...config.userModeling, ...data.userModeling };
    }
    if (data.reinforcementLearning) {
      config.reinforcementLearning = { ...config.reinforcementLearning, ...data.reinforcementLearning };
    }
    if (data.assessmentConfig) {
      config.assessmentConfig = { ...config.assessmentConfig, ...data.assessmentConfig };
    }
    if (data.gamificationConfig) {
      config.gamificationConfig = { ...config.gamificationConfig, ...data.gamificationConfig };
    }
    
    return config;
  }
}

// Global configuration instance
export const config = AdaptiveLearningConfig.getInstance();

// Environment-based configuration loading
export function loadConfigFromEnv(): void {
  // In a browser environment, we'll load from chrome.storage.local
  // This will be implemented in the storage manager
}

// Auto-load on import
loadConfigFromEnv();
