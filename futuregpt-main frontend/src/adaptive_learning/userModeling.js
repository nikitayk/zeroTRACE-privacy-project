// TensorFlow.js-based User Modeling for Adaptive Learning
import * as tf from '@tensorflow/tfjs';

class UserInteraction {
  constructor(timestamp, domain, topic, questionId, difficultyLevel, responseTime, isCorrect, hintUsed = false, attempts = 1, confidenceScore = 0.5) {
    this.timestamp = timestamp;
    this.domain = domain;
    this.topic = topic;
    this.questionId = questionId;
    this.difficultyLevel = difficultyLevel;
    this.responseTime = responseTime; // in seconds
    this.isCorrect = isCorrect;
    this.hintUsed = hintUsed;
    this.attempts = attempts;
    this.confidenceScore = confidenceScore; // User's self-reported confidence (0-1)
  }
}

class UserModel {
  constructor(userId) {
    this.userId = userId;
    this.interactionsHistory = [];
    this.knowledgeState = {}; // Topic -> proficiency score (0-1)
    this.learningStyleScores = {
      visual: 0.5,
      auditory: 0.5,
      kinesthetic: 0.5,
      reading: 0.5
    };
    this.cognitiveLoadCapacity = 0.7; // Estimated cognitive capacity (0-1)
    this.motivationLevel = 0.8; // Current motivation (0-1)
    this.attentionSpan = 25.0; // Estimated attention span in minutes
    
    // TensorFlow.js models
    this.knowledgePredictor = null;
    this.difficultyRecommender = null;
    this.engagementPredictor = null;
    this.useTensorFlow = false;
    
    this.initializeModels();
  }

  async initializeModels() {
    try {
      // Check if TensorFlow.js is available
      if (typeof tf === 'undefined') {
        console.warn('TensorFlow.js not available, using fallback models');
        this.useTensorFlow = false;
        return;
      }

      // Knowledge state prediction model
      this.knowledgePredictor = tf.sequential({
        layers: [
          tf.layers.dense({ units: 64, activation: 'relu', inputShape: [50] }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Probability of knowing concept
        ]
      });

      this.knowledgePredictor.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Difficulty recommendation model (outputs difficulty level 0-1)
      this.difficultyRecommender = tf.sequential({
        layers: [
          tf.layers.dense({ units: 64, activation: 'relu', inputShape: [50] }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Recommended difficulty (0-1)
        ]
      });

      this.difficultyRecommender.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Engagement prediction model
      this.engagementPredictor = tf.sequential({
        layers: [
          tf.layers.dense({ units: 32, activation: 'relu', inputShape: [20] }), // Engagement features
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Predicted engagement (0-1)
        ]
      });

      this.engagementPredictor.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.useTensorFlow = true;
      console.log(`Initialized TensorFlow.js models for user ${this.userId}`);

    } catch (error) {
      console.error('Error initializing TensorFlow.js models:', error);
      this.useTensorFlow = false;
      this.initializeFallbackModels();
    }
  }

  initializeFallbackModels() {
    console.log('Using fallback rule-based models');
    this.useTensorFlow = false;
  }

  addInteraction(interaction) {
    this.interactionsHistory.push(interaction);
    
    // Update knowledge state immediately
    this.updateKnowledgeStateImmediate(interaction);
    
    // Update models periodically (every N interactions)
    if (this.interactionsHistory.length % 10 === 0) {
      this.updateModels();
    }
  }

  updateKnowledgeStateImmediate(interaction) {
    const topic = interaction.topic;
    const currentProb = this.knowledgeState[topic] || 0.5;
    
    // Evidence strength based on response characteristics
    const timeFactor = Math.min(1.0, 60.0 / Math.max(1.0, interaction.responseTime)); // Faster = more confident
    const confidenceFactor = interaction.confidenceScore;
    const difficultyFactor = this.getDifficultyMultiplier(interaction.difficultyLevel);
    
    const evidenceStrength = (timeFactor + confidenceFactor + difficultyFactor) / 3.0;
    
    let newProb;
    if (interaction.isCorrect) {
      // Positive evidence - increase knowledge probability
      newProb = currentProb + (1 - currentProb) * evidenceStrength * 0.3;
    } else {
      // Negative evidence - decrease knowledge probability  
      newProb = currentProb * (1 - evidenceStrength * 0.2);
    }
    
    this.knowledgeState[topic] = Math.max(0.01, Math.min(0.99, newProb));
  }

  getDifficultyMultiplier(difficulty) {
    const multipliers = {
      'beginner': 0.3,
      'intermediate': 0.6,
      'advanced': 0.9,
      'expert': 1.2
    };
    return multipliers[difficulty] || 0.6;
  }

  extractFeatures(interaction = null, topic = null) {
    const features = [];
    
    // Recent performance features (last 10 interactions)
    const recentInteractions = this.interactionsHistory.slice(-10);
    if (recentInteractions.length > 0) {
      features.push(
        recentInteractions.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / recentInteractions.length,
        recentInteractions.reduce((sum, i) => sum + i.responseTime, 0) / recentInteractions.length,
        recentInteractions.reduce((sum, i) => sum + i.attempts, 0) / recentInteractions.length,
        recentInteractions.filter(i => i.hintUsed).length / recentInteractions.length
      );
    } else {
      features.push(0.5, 30.0, 1.0, 0.0);
    }
    
    // Topic-specific features
    if (topic) {
      const topicInteractions = recentInteractions.filter(i => i.topic === topic);
      if (topicInteractions.length > 0) {
        features.push(
          topicInteractions.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / topicInteractions.length,
          topicInteractions.length,
          this.knowledgeState[topic] || 0.5
        );
      } else {
        features.push(0.5, 0, 0.5);
      }
    } else {
      features.push(0.5, 0, 0.5);
    }
    
    // User characteristics
    features.push(
      this.cognitiveLoadCapacity,
      this.motivationLevel,
      this.attentionSpan / 60.0, // Normalize to hours
      this.learningStyleScores.visual,
      this.learningStyleScores.auditory,
      this.learningStyleScores.kinesthetic,
      this.learningStyleScores.reading
    );
    
    // Time-based features
    const currentTime = new Date();
    features.push(
      currentTime.getHours() / 24.0, // Time of day
      currentTime.getDay() / 6.0, // Day of week
      this.interactionsHistory.filter(i => {
        const interactionDate = new Date(i.timestamp);
        return interactionDate.toDateString() === currentTime.toDateString();
      }).length / 20.0 // Today's activity
    );
    
    // Pad or truncate to expected dimension
    while (features.length < 50) {
      features.push(0.0);
    }
    return features.slice(0, 50);
  }

  async predictKnowledgeProbability(topic) {
    try {
      if (this.knowledgePredictor && this.useTensorFlow) {
        const features = this.extractFeatures(null, topic);
        const inputTensor = tf.tensor2d([features], [1, 50]);
        const prediction = await this.knowledgePredictor.predict(inputTensor).data();
        inputTensor.dispose();
        return prediction[0];
      }
    } catch (error) {
      console.warn('TensorFlow.js prediction failed, using fallback:', error);
    }
    
    // Fallback to current knowledge state
    return this.knowledgeState[topic] || 0.5;
  }

  recommendDifficulty(topic, domain) {
    try {
      if (this.difficultyRecommender && this.useTensorFlow) {
        const features = this.extractFeatures(null, topic);
        const inputTensor = tf.tensor2d([features], [1, 50]);
        const difficultyScore = this.difficultyRecommender.predict(inputTensor).dataSync()[0];
        inputTensor.dispose();
        
        // Map score to difficulty level
        if (difficultyScore < 0.3) return 'beginner';
        else if (difficultyScore < 0.6) return 'intermediate';
        else if (difficultyScore < 0.85) return 'advanced';
        else return 'expert';
      }
    } catch (error) {
      console.error('Error in difficulty recommendation:', error);
    }
    
    // Fallback calculation
    const knowledgeProb = this.knowledgeState[topic] || 0.5;
    const recentPerformance = this.getRecentTopicPerformance(topic);
    const difficultyScore = (knowledgeProb + recentPerformance) / 2.0;
    
    if (difficultyScore < 0.3) return 'beginner';
    else if (difficultyScore < 0.6) return 'intermediate';
    else if (difficultyScore < 0.85) return 'advanced';
    else return 'expert';
  }

  getRecentTopicPerformance(topic, days = 7) {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentInteractions = this.interactionsHistory.filter(
      i => i.topic === topic && i.timestamp > cutoffTime
    );
    
    if (recentInteractions.length === 0) return 0.5;
    
    return recentInteractions.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / recentInteractions.length;
  }

  async predictEngagement(sessionContext) {
    try {
      if (this.engagementPredictor && this.useTensorFlow) {
        const engagementFeatures = this.extractEngagementFeatures(sessionContext);
        const inputTensor = tf.tensor2d([engagementFeatures], [1, 20]);
        const prediction = await this.engagementPredictor.predict(inputTensor).data();
        inputTensor.dispose();
        return prediction[0];
      }
    } catch (error) {
      console.warn('Engagement prediction failed:', error);
    }
    
    // Fallback engagement calculation
    return this.calculateEngagementHeuristic(sessionContext);
  }

  extractEngagementFeatures(sessionContext) {
    const features = [];
    
    // Session characteristics
    features.push(
      (sessionContext.sessionDuration || 0) / 60.0, // Duration in minutes
      sessionContext.questionsAnswered || 0,
      (sessionContext.correctAnswers || 0) / Math.max(1, sessionContext.questionsAnswered || 1),
      sessionContext.hintsUsed || 0,
      (sessionContext.timeSinceLastSession || 24) / 24.0 // Hours since last session
    );
    
    // User state
    features.push(
      this.motivationLevel,
      this.cognitiveLoadCapacity,
      this.interactionsHistory.length / 1000.0, // Experience level
      this.interactionsHistory.slice(-20).reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / Math.max(1, this.interactionsHistory.slice(-20).length)
    );
    
    // Time and context
    const currentTime = new Date();
    features.push(
      currentTime.getHours() / 24.0,
      currentTime.getDay() < 5 ? 1.0 : 0.0, // Weekday vs weekend
      sessionContext.difficultyLevelNumeric || 0.5,
      new Set(this.interactionsHistory.slice(-10).map(i => i.topic)).size / 10.0 // Topic variety
    );
    
    // Pad to 20 features
    while (features.length < 20) {
      features.push(0.0);
    }
    return features.slice(0, 20);
  }

  calculateEngagementHeuristic(sessionContext) {
    const factors = [];
    
    // Performance factor
    const recentAccuracy = (sessionContext.correctAnswers || 0) / Math.max(1, sessionContext.questionsAnswered || 1);
    factors.push(Math.min(1.0, recentAccuracy * 1.5)); // Boost for good performance
    
    // Time factor
    const sessionDuration = (sessionContext.sessionDuration || 0) / 60.0;
    const optimalDuration = Math.min(1.0, sessionDuration / this.attentionSpan);
    factors.push(optimalDuration);
    
    // Motivation and capacity
    factors.push(this.motivationLevel, this.cognitiveLoadCapacity);
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  async updateModels() {
    if (!this.useTensorFlow || this.interactionsHistory.length < 20) {
      return; // Need minimum data
    }
    
    try {
      // Prepare training data
      const { X, yKnowledge, yDifficulty } = this.prepareTrainingData();
      
      if (X.length > 0) {
        // Update knowledge predictor
        const XTensor = tf.tensor2d(X);
        const yKnowledgeTensor = tf.tensor2d(yKnowledge, [yKnowledge.length, 1]);
        
        await this.knowledgePredictor.fit(XTensor, yKnowledgeTensor, {
          epochs: 10,
          batchSize: 32,
          validationSplit: 0.2,
          verbose: 0
        });
        
        // Update difficulty recommender
        const yDifficultyTensor = tf.tensor2d(yDifficulty, [yDifficulty.length, 1]);
        
        await this.difficultyRecommender.fit(XTensor, yDifficultyTensor, {
          epochs: 10,
          batchSize: 32,
          validationSplit: 0.2,
          verbose: 0
        });
        
        // Clean up tensors
        XTensor.dispose();
        yKnowledgeTensor.dispose();
        yDifficultyTensor.dispose();
        
        console.log(`Updated models for user ${this.userId} with ${X.length} samples`);
      }
    } catch (error) {
      console.error('Error updating models:', error);
    }
  }

  prepareTrainingData() {
    const X = [], yKnowledge = [], yDifficulty = [];
    
    // Use last 100 interactions
    const recentInteractions = this.interactionsHistory.slice(-100);
    
    for (const interaction of recentInteractions) {
      const features = this.extractFeatures(interaction, interaction.topic);
      X.push(features);
      
      // Knowledge label (whether user got it right)
      yKnowledge.push([interaction.isCorrect ? 1 : 0]);
      
      // Difficulty label (optimal difficulty based on performance)
      const optimalDifficulty = this.calculateOptimalDifficulty(interaction);
      yDifficulty.push([optimalDifficulty]);
    }
    
    return { X, yKnowledge, yDifficulty };
  }

  calculateOptimalDifficulty(interaction) {
    // If user got it right quickly, could handle harder
    if (interaction.isCorrect && interaction.responseTime < 30) {
      return Math.min(1.0, this.difficultyToNumeric(interaction.difficultyLevel) + 0.2);
    }
    // If user struggled, should be easier
    else if (!interaction.isCorrect || interaction.responseTime > 120) {
      return Math.max(0.0, this.difficultyToNumeric(interaction.difficultyLevel) - 0.2);
    }
    else {
      return this.difficultyToNumeric(interaction.difficultyLevel);
    }
  }

  difficultyToNumeric(difficulty) {
    const mapping = { 'beginner': 0.25, 'intermediate': 0.5, 'advanced': 0.75, 'expert': 1.0 };
    return mapping[difficulty] || 0.5;
  }

  getLearningAnalytics() {
    if (this.interactionsHistory.length === 0) {
      return { status: 'no_data', message: 'No learning interactions recorded yet' };
    }
    
    const recentInteractions = this.interactionsHistory.slice(-20);
    
    const analytics = {
      userId: this.userId,
      totalInteractions: this.interactionsHistory.length,
      knowledgeState: { ...this.knowledgeState },
      overallAccuracy: this.interactionsHistory.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / this.interactionsHistory.length,
      recentAccuracy: recentInteractions.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / recentInteractions.length,
      averageResponseTime: this.interactionsHistory.reduce((sum, i) => sum + i.responseTime, 0) / this.interactionsHistory.length,
      learningStyleScores: { ...this.learningStyleScores },
      cognitiveLoadCapacity: this.cognitiveLoadCapacity,
      motivationLevel: this.motivationLevel,
      attentionSpanMinutes: this.attentionSpan,
      topicsStudied: [...new Set(this.interactionsHistory.map(i => i.topic))],
      domainsActive: [...new Set(this.interactionsHistory.map(i => i.domain))],
      masteredTopics: Object.entries(this.knowledgeState).filter(([topic, prob]) => prob > 0.85).map(([topic]) => topic),
      strugglingTopics: Object.entries(this.knowledgeState).filter(([topic, prob]) => prob < 0.3).map(([topic]) => topic),
      lastUpdated: new Date().toISOString()
    };
    
    // Performance trends
    if (this.interactionsHistory.length >= 10) {
      const firstHalf = this.interactionsHistory.slice(0, Math.floor(this.interactionsHistory.length / 2));
      const secondHalf = this.interactionsHistory.slice(Math.floor(this.interactionsHistory.length / 2));
      
      analytics.learningTrend = {
        earlyAccuracy: firstHalf.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / firstHalf.length,
        recentAccuracy: secondHalf.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / secondHalf.length,
        improvement: (secondHalf.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / secondHalf.length) - 
                    (firstHalf.reduce((sum, i) => sum + (i.isCorrect ? 1 : 0), 0) / firstHalf.length)
      };
    }
    
    return analytics;
  }

  exportUserData() {
    return {
      userModel: {
        userId: this.userId,
        knowledgeState: this.knowledgeState,
        learningStyleScores: this.learningStyleScores,
        cognitiveLoadCapacity: this.cognitiveLoadCapacity,
        motivationLevel: this.motivationLevel,
        attentionSpan: this.attentionSpan
      },
      interactionsHistory: this.interactionsHistory.map(interaction => ({
        timestamp: interaction.timestamp,
        domain: interaction.domain,
        topic: interaction.topic,
        questionId: interaction.questionId,
        difficultyLevel: interaction.difficultyLevel,
        responseTime: interaction.responseTime,
        isCorrect: interaction.isCorrect,
        hintUsed: interaction.hintUsed,
        attempts: interaction.attempts,
        confidenceScore: interaction.confidenceScore
      })),
      analytics: this.getLearningAnalytics(),
      exportedAt: new Date().toISOString()
    };
  }

  clearUserData() {
    this.interactionsHistory = [];
    this.knowledgeState = {};
    this.learningStyleScores = { visual: 0.5, auditory: 0.5, kinesthetic: 0.5, reading: 0.5 };
    this.cognitiveLoadCapacity = 0.7;
    this.motivationLevel = 0.8;
    this.attentionSpan = 25.0;
    console.log(`Cleared all data for user ${this.userId}`);
  }
}

export { UserModel, UserInteraction };
