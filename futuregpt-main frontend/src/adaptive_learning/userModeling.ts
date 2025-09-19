// User Modeling with TensorFlow.js for Adaptive Learning
import * as tf from '@tensorflow/tfjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { storageManager } from './storage';

export interface UserInteraction {
  id: string;
  userId: string;
  timestamp: number;
  domain: string;
  topic: string;
  questionId: string;
  difficultyLevel: string;
  responseTime: number; // in seconds
  isCorrect: boolean;
  hintUsed: boolean;
  attempts: number;
  confidenceScore: number; // User's self-reported confidence (0-1)
  sessionId?: string;
}

export interface KnowledgeState {
  [topic: string]: number; // Topic -> proficiency score (0-1)
}

export interface LearningStyleScores {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
}

export interface UserModel {
  userId: string;
  knowledgeState: KnowledgeState;
  learningStyleScores: LearningStyleScores;
  cognitiveLoadCapacity: number; // Estimated cognitive capacity (0-1)
  motivationLevel: number; // Current motivation (0-1)
  attentionSpan: number; // Estimated attention span in minutes
  lastUpdated: string;
  totalInteractions: number;
  averageAccuracy: number;
  studyStreak: number;
  lastStudyDate: string;
}

export class UserModelingSystem {
  private userModel: UserModel | null = null;
  private knowledgePredictor: tf.LayersModel | null = null;
  private difficultyRecommender: tf.LayersModel | null = null;
  private engagementPredictor: tf.LayersModel | null = null;
  private isInitialized = false;

  constructor(private userId: string) {}

  async initialize(): Promise<void> {
    try {
      // Load existing user model from storage
      const savedModel = await storageManager.getUserModel(this.userId);
      
      if (savedModel) {
        this.userModel = savedModel;
      } else {
        // Create new user model
        this.userModel = this.createDefaultUserModel();
        await this.saveUserModel();
      }

      // Initialize TensorFlow.js models
      await this.initializeTensorFlowModels();
      
      this.isInitialized = true;
      console.log(`User modeling system initialized for user: ${this.userId}`);
    } catch (error) {
      console.error('Failed to initialize user modeling system:', error);
      throw error;
    }
  }

  private createDefaultUserModel(): UserModel {
    return {
      userId: this.userId,
      knowledgeState: {},
      learningStyleScores: {
        visual: 0.5,
        auditory: 0.5,
        kinesthetic: 0.5,
        reading: 0.5
      },
      cognitiveLoadCapacity: 0.7,
      motivationLevel: 0.8,
      attentionSpan: 25.0,
      lastUpdated: new Date().toISOString(),
      totalInteractions: 0,
      averageAccuracy: 0.0,
      studyStreak: 0,
      lastStudyDate: new Date().toISOString()
    };
  }

  private async initializeTensorFlowModels(): Promise<void> {
    try {
      // Knowledge state prediction model
      this.knowledgePredictor = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [config.userModeling.featureDimensions]
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      this.knowledgePredictor.compile({
        optimizer: tf.train.adam(config.userModeling.learningRate),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Difficulty recommendation model
      this.difficultyRecommender = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [config.userModeling.featureDimensions]
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      this.difficultyRecommender.compile({
        optimizer: tf.train.adam(config.userModeling.learningRate),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Engagement prediction model
      this.engagementPredictor = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            inputShape: [20]
          }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      this.engagementPredictor.compile({
        optimizer: tf.train.adam(config.userModeling.learningRate),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      console.log('TensorFlow.js models initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js models:', error);
      // Continue without TensorFlow models - will use fallback methods
    }
  }

  async addInteraction(interaction: Omit<UserInteraction, 'id'>): Promise<void> {
    if (!this.userModel) {
      throw new Error('User model not initialized');
    }

    const fullInteraction: UserInteraction = {
      ...interaction,
      id: uuidv4(),
      userId: this.userId
    };

    // Save interaction to storage
    await storageManager.addInteraction(fullInteraction);

    // Update knowledge state immediately
    this.updateKnowledgeStateImmediate(fullInteraction);

    // Update user model statistics
    this.updateUserModelStats(fullInteraction);

    // Save updated user model
    await this.saveUserModel();

    // Update TensorFlow models periodically
    if (this.userModel.totalInteractions % config.userModeling.modelUpdateFrequency === 0) {
      await this.updateTensorFlowModels();
    }
  }

  private updateKnowledgeStateImmediate(interaction: UserInteraction): void {
    if (!this.userModel) return;

    const topic = interaction.topic;
    const currentProb = this.userModel.knowledgeState[topic] || 0.5;

    // Evidence strength based on response characteristics
    const timeFactor = Math.min(1.0, 60.0 / Math.max(1.0, interaction.responseTime));
    const confidenceFactor = interaction.confidenceScore;
    const difficultyFactor = this.getDifficultyMultiplier(interaction.difficultyLevel);

    const evidenceStrength = (timeFactor + confidenceFactor + difficultyFactor) / 3.0;

    let newProb: number;
    if (interaction.isCorrect) {
      // Positive evidence - increase knowledge probability
      newProb = currentProb + (1 - currentProb) * evidenceStrength * 0.3;
    } else {
      // Negative evidence - decrease knowledge probability
      newProb = currentProb * (1 - evidenceStrength * 0.2);
    }

    this.userModel.knowledgeState[topic] = Math.max(0.01, Math.min(0.99, newProb));
  }

  private getDifficultyMultiplier(difficulty: string): number {
    const multipliers: Record<string, number> = {
      beginner: 0.3,
      intermediate: 0.6,
      advanced: 0.9,
      expert: 1.2
    };
    return multipliers[difficulty] || 0.6;
  }

  private updateUserModelStats(interaction: UserInteraction): void {
    if (!this.userModel) return;

    this.userModel.totalInteractions++;
    this.userModel.lastUpdated = new Date().toISOString();

    // Update average accuracy
    const totalCorrect = this.userModel.averageAccuracy * (this.userModel.totalInteractions - 1);
    const newTotalCorrect = totalCorrect + (interaction.isCorrect ? 1 : 0);
    this.userModel.averageAccuracy = newTotalCorrect / this.userModel.totalInteractions;

    // Update study streak
    const today = new Date().toDateString();
    const lastStudy = new Date(this.userModel.lastStudyDate).toDateString();
    
    if (today === lastStudy) {
      // Same day, maintain streak
    } else if (new Date(this.userModel.lastStudyDate).getTime() === new Date(Date.now() - 24 * 60 * 60 * 1000).getTime()) {
      // Consecutive day, increment streak
      this.userModel.studyStreak++;
    } else {
      // Break in streak, reset
      this.userModel.studyStreak = 1;
    }

    this.userModel.lastStudyDate = new Date().toISOString();

    // Update learning style scores based on interaction patterns
    this.updateLearningStyleScores(interaction);
  }

  private updateLearningStyleScores(interaction: UserInteraction): void {
    if (!this.userModel) return;

    // Simple heuristic-based learning style detection
    // In a real implementation, this would be more sophisticated
    
    const learningRate = 0.01;
    
    if (interaction.responseTime < 30) {
      // Quick responses might indicate visual/kinesthetic learning
      this.userModel.learningStyleScores.visual += learningRate;
      this.userModel.learningStyleScores.kinesthetic += learningRate;
    } else if (interaction.responseTime > 120) {
      // Slow responses might indicate reading/auditory learning
      this.userModel.learningStyleScores.reading += learningRate;
      this.userModel.learningStyleScores.auditory += learningRate;
    }

    // Normalize scores to sum to 2.0
    const total = Object.values(this.userModel.learningStyleScores).reduce((sum, score) => sum + score, 0);
    const normalizationFactor = 2.0 / total;
    
    Object.keys(this.userModel.learningStyleScores).forEach(key => {
      this.userModel!.learningStyleScores[key as keyof LearningStyleScores] *= normalizationFactor;
    });
  }

  async predictKnowledgeProbability(topic: string): Promise<number> {
    if (!this.userModel) return 0.5;

    try {
      if (this.knowledgePredictor) {
        const features = this.extractFeatures({ topic });
        const prediction = this.knowledgePredictor.predict(features.expandDims(0)) as tf.Tensor;
        const probability = await prediction.data();
        prediction.dispose();
        return probability[0];
      }
    } catch (error) {
      console.warn('TensorFlow prediction failed, using fallback:', error);
    }

    // Fallback to current knowledge state
    return this.userModel.knowledgeState[topic] || 0.5;
  }

  recommendDifficulty(topic: string, domain: string): string {
    if (!this.userModel) return 'intermediate';

    try {
      let difficultyScore: number;

      if (this.difficultyRecommender) {
        const features = this.extractFeatures({ topic });
        const prediction = this.difficultyRecommender.predict(features.expandDims(0)) as tf.Tensor;
        const score = prediction.dataSync()[0];
        prediction.dispose();
        difficultyScore = score;
      } else {
        // Fallback calculation
        const knowledgeProb = this.userModel.knowledgeState[topic] || 0.5;
        const recentPerformance = this.getRecentTopicPerformance(topic);
        difficultyScore = (knowledgeProb + recentPerformance) / 2.0;
      }

      // Map score to difficulty level
      if (difficultyScore < 0.3) return 'beginner';
      if (difficultyScore < 0.6) return 'intermediate';
      if (difficultyScore < 0.85) return 'advanced';
      return 'expert';
    } catch (error) {
      console.error('Error in difficulty recommendation:', error);
      return 'intermediate'; // Safe default
    }
  }

  private getRecentTopicPerformance(topic: string, days: number = 7): number {
    // This would need to be implemented with actual interaction history
    // For now, return a default value
    return 0.5;
  }

  private extractFeatures(context: { topic?: string; interaction?: UserInteraction }): tf.Tensor {
    const features: number[] = [];

    // Recent performance features (would need actual interaction history)
    features.push(0.5, 30.0, 1.0, 0.0); // Placeholder values

    // Topic-specific features
    if (context.topic && this.userModel) {
      const topicKnowledge = this.userModel.knowledgeState[context.topic] || 0.5;
      features.push(topicKnowledge, 0, topicKnowledge);
    } else {
      features.push(0.5, 0, 0.5);
    }

    // User characteristics
    if (this.userModel) {
      features.push(
        this.userModel.cognitiveLoadCapacity,
        this.userModel.motivationLevel,
        this.userModel.attentionSpan / 60.0,
        ...Object.values(this.userModel.learningStyleScores)
      );
    } else {
      features.push(0.7, 0.8, 0.42, 0.5, 0.5, 0.5, 0.5);
    }

    // Time-based features
    const currentTime = new Date();
    features.push(
      currentTime.getHours() / 24.0,
      currentTime.getDay() / 6.0,
      0.1 // Placeholder for today's activity
    );

    // Pad to expected dimension
    while (features.length < config.userModeling.featureDimensions) {
      features.push(0.0);
    }

    return tf.tensor(features.slice(0, config.userModeling.featureDimensions));
  }

  private async updateTensorFlowModels(): Promise<void> {
    if (!this.knowledgePredictor || !this.difficultyRecommender) return;

    try {
      // Get recent interaction history for training
      const history = await storageManager.getInteractionHistory(this.userId, 100);
      
      if (history.length < 20) return; // Need minimum data

      // Prepare training data
      const { features, knowledgeLabels, difficultyLabels } = this.prepareTrainingData(history);

      if (features.length > 0) {
        const featuresTensor = tf.tensor2d(features);
        const knowledgeTensor = tf.tensor2d(knowledgeLabels, [knowledgeLabels.length, 1]);
        const difficultyTensor = tf.tensor2d(difficultyLabels, [difficultyLabels.length, 1]);

        // Update knowledge predictor
        await this.knowledgePredictor!.fit(featuresTensor, knowledgeTensor, {
          epochs: config.userModeling.epochs,
          batchSize: config.userModeling.batchSize,
          validationSplit: config.userModeling.validationSplit,
          verbose: 0
        });

        // Update difficulty recommender
        await this.difficultyRecommender!.fit(featuresTensor, difficultyTensor, {
          epochs: config.userModeling.epochs,
          batchSize: config.userModeling.batchSize,
          validationSplit: config.userModeling.validationSplit,
          verbose: 0
        });

        // Clean up tensors
        featuresTensor.dispose();
        knowledgeTensor.dispose();
        difficultyTensor.dispose();

        console.log(`Updated TensorFlow models with ${features.length} samples`);
      }
    } catch (error) {
      console.error('Error updating TensorFlow models:', error);
    }
  }

  private prepareTrainingData(history: any[]): {
    features: number[][];
    knowledgeLabels: number[];
    difficultyLabels: number[];
  } {
    const features: number[][] = [];
    const knowledgeLabels: number[] = [];
    const difficultyLabels: number[] = [];

    for (const interaction of history.slice(-100)) { // Use last 100 interactions
      try {
        const featureTensor = this.extractFeatures({ interaction });
        const featureArray = Array.from(featureTensor.dataSync());
        featureTensor.dispose();

        features.push(featureArray);
        knowledgeLabels.push(interaction.isCorrect ? 1 : 0);
        difficultyLabels.push(this.calculateOptimalDifficulty(interaction));
      } catch (error) {
        console.warn('Failed to prepare training data for interaction:', error);
      }
    }

    return { features, knowledgeLabels, difficultyLabels };
  }

  private calculateOptimalDifficulty(interaction: UserInteraction): number {
    // Calculate what the optimal difficulty should have been
    if (interaction.isCorrect && interaction.responseTime < 30) {
      return Math.min(1.0, this.difficultyToNumeric(interaction.difficultyLevel) + 0.2);
    } else if (!interaction.isCorrect || interaction.responseTime > 120) {
      return Math.max(0.0, this.difficultyToNumeric(interaction.difficultyLevel) - 0.2);
    } else {
      return this.difficultyToNumeric(interaction.difficultyLevel);
    }
  }

  private difficultyToNumeric(difficulty: string): number {
    const mapping: Record<string, number> = {
      beginner: 0.25,
      intermediate: 0.5,
      advanced: 0.75,
      expert: 1.0
    };
    return mapping[difficulty] || 0.5;
  }

  async getUserAnalytics(): Promise<any> {
    if (!this.userModel) {
      return { status: 'no_data', message: 'No user model available' };
    }

    const history = await storageManager.getInteractionHistory(this.userId, 20);
    const recentInteractions = history.slice(-20);

    const analytics = {
      userId: this.userId,
      totalInteractions: this.userModel.totalInteractions,
      knowledgeState: { ...this.userModel.knowledgeState },
      overallAccuracy: this.userModel.averageAccuracy,
      recentAccuracy: recentInteractions.length > 0 
        ? recentInteractions.filter(i => i.isCorrect).length / recentInteractions.length 
        : 0,
      averageResponseTime: recentInteractions.length > 0
        ? recentInteractions.reduce((sum, i) => sum + i.responseTime, 0) / recentInteractions.length
        : 0,
      learningStyleScores: { ...this.userModel.learningStyleScores },
      cognitiveLoadCapacity: this.userModel.cognitiveLoadCapacity,
      motivationLevel: this.userModel.motivationLevel,
      attentionSpanMinutes: this.userModel.attentionSpan,
      studyStreak: this.userModel.studyStreak,
      topicsStudied: Object.keys(this.userModel.knowledgeState),
      masteredTopics: Object.entries(this.userModel.knowledgeState)
        .filter(([_, prob]) => prob > 0.85)
        .map(([topic, _]) => topic),
      strugglingTopics: Object.entries(this.userModel.knowledgeState)
        .filter(([_, prob]) => prob < 0.3)
        .map(([topic, _]) => topic),
      lastUpdated: this.userModel.lastUpdated
    };

    return analytics;
  }

  private async saveUserModel(): Promise<void> {
    if (this.userModel) {
      await storageManager.saveUserModel(this.userId, this.userModel);
    }
  }

  async exportUserData(): Promise<any> {
    const analytics = await this.getUserAnalytics();
    const history = await storageManager.getInteractionHistory(this.userId);
    const sessions = await storageManager.getLearningSessions(this.userId);
    const achievements = await storageManager.getAchievements(this.userId);

    return {
      userModel: this.userModel,
      analytics,
      interactionHistory: history,
      learningSessions: sessions,
      achievements,
      exportedAt: new Date().toISOString()
    };
  }

  async clearUserData(): Promise<void> {
    this.userModel = this.createDefaultUserModel();
    await this.saveUserModel();
    await storageManager.clearUserData(this.userId);
    console.log(`Cleared all data for user ${this.userId}`);
  }

  getUserModel(): UserModel | null {
    return this.userModel;
  }

  isReady(): boolean {
    return this.isInitialized && this.userModel !== null;
  }
}
