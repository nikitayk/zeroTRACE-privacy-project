// Adaptive Learning Configuration Management
class APIConfig {
  constructor() {
    this.baseUrl = '';
    this.apiKey = '';
    this.modelName = 'gpt-3.5-turbo';
    this.maxTokens = 2048;
    this.temperature = 0.7;
    this.timeout = 30000;
  }

  update(baseUrl, apiKey, modelName = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    if (modelName) this.modelName = modelName;
  }

  isValid() {
    return this.baseUrl && this.apiKey;
  }
}

class LearningDomainConfig {
  constructor(domainId, displayName, description, topics, difficultyLevels, assessmentTypes) {
    this.domainId = domainId;
    this.displayName = displayName;
    this.description = description;
    this.topics = topics || [];
    this.difficultyLevels = difficultyLevels || ['beginner', 'intermediate', 'advanced', 'expert'];
    this.assessmentTypes = assessmentTypes || ['mcq', 'subjective', 'practical', 'case_study'];
  }
}

class UserModelingConfig {
  constructor() {
    this.modelUpdateFrequency = 10; // Update after every 10 interactions
    this.featureDimensions = 50;
    this.learningRate = 0.001;
    this.batchSize = 32;
    this.epochs = 100;
    this.validationSplit = 0.2;
  }
}

class ReinforcementLearningConfig {
  constructor() {
    this.algorithm = 'PPO';
    this.explorationRate = 0.1;
    this.learningRate = 0.0003;
    this.gamma = 0.99; // Discount factor
    this.updateFrequency = 5;
    this.maxEpisodeLength = 100;
  }
}

class AdaptiveLearningConfig {
  constructor() {
    this.apiConfig = new APIConfig();
    this.userModeling = new UserModelingConfig();
    this.reinforcementLearning = new ReinforcementLearningConfig();
    
    // Learning domains configuration
    this.learningDomains = {
      dsa_programming: new LearningDomainConfig(
        'dsa_programming',
        'Data Structures & Algorithms',
        'Master coding interviews and competitive programming',
        ['arrays', 'linked_lists', 'trees', 'graphs', 'dynamic_programming', 
         'greedy', 'backtracking', 'sorting', 'searching', 'system_design']
      ),
      upsc_preparation: new LearningDomainConfig(
        'upsc_preparation',
        'UPSC Civil Services',
        'Comprehensive preparation for UPSC examinations',
        ['indian_polity', 'geography', 'history', 'economics', 'current_affairs',
         'ethics', 'international_relations', 'science_technology', 'environment', 'essay_writing']
      ),
      jee_preparation: new LearningDomainConfig(
        'jee_preparation',
        'JEE (Joint Entrance Examination)',
        'Engineering entrance exam preparation',
        ['physics_mechanics', 'physics_waves', 'chemistry_organic', 'chemistry_inorganic',
         'mathematics_calculus', 'mathematics_algebra', 'coordinate_geometry', 'trigonometry']
      ),
      developer_skills: new LearningDomainConfig(
        'developer_skills',
        'Software Development',
        'Modern software development skills and technologies',
        ['frontend_development', 'backend_development', 'mobile_development', 'devops',
         'cloud_computing', 'databases', 'api_design', 'testing', 'security', 'ai_ml_integration']
      )
    };

    // Assessment and adaptation settings
    this.assessmentConfig = {
      minQuestionsPerTopic: 5,
      maxQuestionsPerSession: 20,
      adaptiveThreshold: 0.7, // Accuracy threshold for difficulty adjustment
      masteryThreshold: 0.85, // Threshold to consider topic mastered
      timeWeight: 0.3, // Weight given to time taken in scoring
      difficultyAdjustmentRate: 0.1
    };

    // Gamification settings
    this.gamificationConfig = {
      pointsPerCorrectAnswer: 10,
      bonusStreakMultiplier: 1.5,
      dailyGoalBonus: 50,
      levelUpThreshold: 1000,
      achievementThresholds: {
        firstSteps: 1,
        streakWarrior: 7,
        dedicatedLearner: 30,
        topicMaster: 1, // Master any topic
        domainExpert: 1 // Master any domain
      }
    };
  }

  updateApiConfig(baseUrl, apiKey, modelName = null) {
    this.apiConfig.update(baseUrl, apiKey, modelName);
  }

  getDomainConfig(domainId) {
    return this.learningDomains[domainId];
  }

  toDict() {
    return {
      apiConfig: {
        baseUrl: this.apiConfig.baseUrl,
        modelName: this.apiConfig.modelName,
        maxTokens: this.apiConfig.maxTokens,
        temperature: this.apiConfig.temperature,
        timeout: this.apiConfig.timeout
      },
      userModeling: {
        modelUpdateFrequency: this.userModeling.modelUpdateFrequency,
        featureDimensions: this.userModeling.featureDimensions,
        learningRate: this.userModeling.learningRate,
        batchSize: this.userModeling.batchSize,
        epochs: this.userModeling.epochs,
        validationSplit: this.userModeling.validationSplit
      },
      reinforcementLearning: {
        algorithm: this.reinforcementLearning.algorithm,
        explorationRate: this.reinforcementLearning.explorationRate,
        learningRate: this.reinforcementLearning.learningRate,
        gamma: this.reinforcementLearning.gamma,
        updateFrequency: this.reinforcementLearning.updateFrequency,
        maxEpisodeLength: this.reinforcementLearning.maxEpisodeLength
      },
      assessmentConfig: this.assessmentConfig,
      gamificationConfig: this.gamificationConfig
    };
  }

  static fromDict(data) {
    const config = new AdaptiveLearningConfig();
    
    if (data.apiConfig) {
      config.apiConfig.baseUrl = data.apiConfig.baseUrl || '';
      config.apiConfig.modelName = data.apiConfig.modelName || 'gpt-3.5-turbo';
      config.apiConfig.maxTokens = data.apiConfig.maxTokens || 2048;
      config.apiConfig.temperature = data.apiConfig.temperature || 0.7;
      config.apiConfig.timeout = data.apiConfig.timeout || 30000;
    }
    
    if (data.userModeling) {
      Object.assign(config.userModeling, data.userModeling);
    }
    
    if (data.reinforcementLearning) {
      Object.assign(config.reinforcementLearning, data.reinforcementLearning);
    }
    
    if (data.assessmentConfig) {
      Object.assign(config.assessmentConfig, data.assessmentConfig);
    }
    
    if (data.gamificationConfig) {
      Object.assign(config.gamificationConfig, data.gamificationConfig);
    }
    
    return config;
  }
}

// Global configuration instance
const config = new AdaptiveLearningConfig();

// Environment-based configuration loading
function loadConfigFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['adaptiveLearningConfig'], (result) => {
      if (result.adaptiveLearningConfig) {
        const loadedConfig = AdaptiveLearningConfig.fromDict(result.adaptiveLearningConfig);
        Object.assign(config, loadedConfig);
        console.log('Loaded adaptive learning configuration from storage');
      }
      resolve(config);
    });
  });
}

function saveConfigToStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      adaptiveLearningConfig: config.toDict()
    }, () => {
      console.log('Saved adaptive learning configuration to storage');
      resolve();
    });
  });
}

export { 
  AdaptiveLearningConfig, 
  APIConfig, 
  LearningDomainConfig, 
  UserModelingConfig, 
  ReinforcementLearningConfig,
  config,
  loadConfigFromStorage,
  saveConfigToStorage
};
