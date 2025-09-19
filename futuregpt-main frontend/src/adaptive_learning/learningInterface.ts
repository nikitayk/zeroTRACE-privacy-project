// Main Learning Interface for Adaptive Learning System
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { storageManager } from './storage';
import { UserModelingSystem, UserInteraction } from './userModeling';
import { contentGenerator, Question } from './contentGeneration';

export interface LearningSession {
  sessionId: string;
  userId: string;
  domain: string;
  startTime: Date;
  endTime?: Date;
  questionsAnswered: number;
  correctAnswers: number;
  totalTimeSpent: number; // minutes
  topicsCovered: Set<string>;
  currentQuestion?: Question;
  sessionState: 'active' | 'paused' | 'completed';
}

export interface DomainProgress {
  overallProgress: number;
  topicsMastered: number;
  totalTopics: number;
  domainInteractions: number;
  lastStudied?: string;
  averageAccuracy: number;
  studyStreak: number;
}

export interface LearningRecommendation {
  type: 'practice' | 'review' | 'explanation' | 'break';
  topic: string;
  difficulty: string;
  estimatedTime: number;
  description: string;
  priority: number;
  reason: string;
}

export interface SessionFeedback {
  isCorrect: boolean;
  explanation: string;
  hints: string[];
  knowledgeUpdate: number;
  sessionProgress: {
    questionsAnswered: number;
    accuracy: number;
    sessionDurationMinutes: number;
    topicsCovered: number;
    estimatedRemainingTime: number;
  };
  nextQuestion?: Question;
  continueSession: boolean;
}

export class AdaptiveLearningInterface {
  private userModeling: UserModelingSystem;
  private currentSession: LearningSession | null = null;
  private currentDomain: string | null = null;
  private isInitialized = false;

  constructor(private userId: string) {
    this.userModeling = new UserModelingSystem(userId);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize storage
      await storageManager.initialize();
      
      // Initialize user modeling system
      await this.userModeling.initialize();
      
      this.isInitialized = true;
      console.log(`Adaptive learning interface initialized for user: ${this.userId}`);
    } catch (error) {
      console.error('Failed to initialize adaptive learning interface:', error);
      throw error;
    }
  }

  async getAvailableDomains(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    topics: string[];
    userProgress: DomainProgress;
  }>> {
    if (!this.isInitialized) {
      throw new Error('Learning interface not initialized');
    }

    const domains = [];
    for (const [domainId, domainConfig] of Object.entries(config.learningDomains)) {
      const progress = await this.getDomainProgress(domainId);
      domains.push({
        id: domainId,
        name: domainConfig.displayName,
        description: domainConfig.description,
        topics: domainConfig.topics,
        userProgress: progress
      });
    }
    return domains;
  }

  private async getDomainProgress(domainId: string): Promise<DomainProgress> {
    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) {
      return {
        overallProgress: 0.0,
        topicsMastered: 0,
        totalTopics: 0,
        domainInteractions: 0,
        averageAccuracy: 0.0,
        studyStreak: 0
      };
    }

    const userModel = this.userModeling.getUserModel();
    if (!userModel) {
      return {
        overallProgress: 0.0,
        topicsMastered: 0,
        totalTopics: domainConfig.topics.length,
        domainInteractions: 0,
        averageAccuracy: 0.0,
        studyStreak: 0
      };
    }

    const topics = domainConfig.topics;
    let masteredCount = 0;
    let totalProgress = 0.0;

    for (const topic of topics) {
      const knowledgeProb = userModel.knowledgeState[topic] || 0.0;
      totalProgress += knowledgeProb;
      if (knowledgeProb > 0.85) { // Mastery threshold
        masteredCount++;
      }
    }

    // Get domain-specific interactions
    const history = await storageManager.getInteractionHistory(this.userId);
    const domainInteractions = history.filter(i => i.domain === domainId).length;

    return {
      overallProgress: totalProgress / topics.length,
      topicsMastered: masteredCount,
      totalTopics: topics.length,
      domainInteractions,
      lastStudied: userModel.lastStudyDate,
      averageAccuracy: userModel.averageAccuracy,
      studyStreak: userModel.studyStreak
    };
  }

  async selectDomain(domainId: string): Promise<{
    success: boolean;
    domain?: any;
    progress?: DomainProgress;
    recommendations?: LearningRecommendation[];
    nextSteps?: LearningRecommendation[];
    error?: string;
  }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Learning interface not initialized' };
    }

    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) {
      return { success: false, error: 'Invalid domain selected' };
    }

    this.currentDomain = domainId;

    const progress = await this.getDomainProgress(domainId);
    const recommendations = await this.getDomainRecommendations(domainId);
    const nextSteps = await this.getSuggestedNextSteps(domainId);

    return {
      success: true,
      domain: {
        id: domainId,
        name: domainConfig.displayName,
        description: domainConfig.description
      },
      progress,
      recommendations,
      nextSteps
    };
  }

  private async getDomainRecommendations(domainId: string): Promise<LearningRecommendation[]> {
    const userModel = this.userModeling.getUserModel();
    if (!userModel) return [];

    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) return [];

    const recommendations: LearningRecommendation[] = [];

    // Find struggling topics
    const strugglingTopics = Object.entries(userModel.knowledgeState)
      .filter(([topic, prob]) => prob < 0.3 && domainConfig.topics.includes(topic))
      .map(([topic, _]) => topic);

    // Find mastered topics
    const masteredTopics = Object.entries(userModel.knowledgeState)
      .filter(([topic, prob]) => prob > 0.85 && domainConfig.topics.includes(topic))
      .map(([topic, _]) => topic);

    // Add recommendations for struggling topics
    strugglingTopics.slice(0, 3).forEach(topic => {
      recommendations.push({
        type: 'practice',
        topic,
        difficulty: this.userModeling.recommendDifficulty(topic, domainId),
        estimatedTime: 15,
        description: `Practice ${topic.replace('_', ' ')} to improve understanding`,
        priority: 1.0,
        reason: 'Low knowledge level detected'
      });
    });

    // Add review recommendations for mastered topics
    if (masteredTopics.length > 0) {
      recommendations.push({
        type: 'review',
        topic: masteredTopics[0],
        difficulty: 'intermediate',
        estimatedTime: 10,
        description: `Review ${masteredTopics[0].replace('_', ' ')} to maintain mastery`,
        priority: 0.7,
        reason: 'Topic mastered, periodic review recommended'
      });
    }

    // Add explanation recommendations for intermediate topics
    const intermediateTopics = domainConfig.topics.filter(topic => {
      const knowledge = userModel.knowledgeState[topic] || 0.0;
      return knowledge >= 0.3 && knowledge < 0.7;
    });

    if (intermediateTopics.length > 0) {
      recommendations.push({
        type: 'explanation',
        topic: intermediateTopics[0],
        difficulty: 'intermediate',
        estimatedTime: 8,
        description: `Get detailed explanation of ${intermediateTopics[0].replace('_', ' ')}`,
        priority: 0.8,
        reason: 'Intermediate understanding, explanation needed'
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private async getSuggestedNextSteps(domainId: string): Promise<LearningRecommendation[]> {
    const userModel = this.userModeling.getUserModel();
    if (!userModel) return [];

    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) return [];

    const nextSteps: LearningRecommendation[] = [];

    // Find topics to focus on
    for (const topic of domainConfig.topics.slice(0, 5)) {
      const knowledgeProb = userModel.knowledgeState[topic] || 0.0;
      const difficulty = this.userModeling.recommendDifficulty(topic, domainId);
      
      if (knowledgeProb < 0.85) { // Not mastered yet
        nextSteps.push({
          type: 'practice',
          topic,
          difficulty,
          estimatedTime: 15 + (difficulty === 'advanced' ? 5 : 0) + (difficulty === 'expert' ? 10 : 0),
          description: `Practice ${topic.replace('_', ' ')} at ${difficulty} level`,
          priority: 1.0 - knowledgeProb, // Higher priority for lower knowledge
          reason: 'Topic needs improvement'
        });
      }
    }

    return nextSteps.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }

  async startLearningSession(): Promise<{
    success: boolean;
    sessionId?: string;
    question?: Question;
    sessionInfo?: any;
    error?: string;
  }> {
    if (!this.isInitialized || !this.currentDomain) {
      return { success: false, error: 'No domain selected or interface not initialized' };
    }

    try {
      const sessionId = `session_${this.userId}_${Date.now()}`;
      
      this.currentSession = {
        sessionId,
        userId: this.userId,
        domain: this.currentDomain,
        startTime: new Date(),
        questionsAnswered: 0,
        correctAnswers: 0,
        totalTimeSpent: 0,
        topicsCovered: new Set(),
        sessionState: 'active'
      };

      // Save session to storage
      await storageManager.saveLearningSession(this.currentSession);

      // Get first question
      const firstQuestion = await this.getNextQuestion();

      return {
        success: true,
        sessionId,
        question: firstQuestion || undefined,
        sessionInfo: {
          domain: this.currentDomain,
          estimatedSessionLength: this.recommendStudyTime(),
          focusAreas: await this.getCurrentFocusAreas()
        }
      };
    } catch (error) {
      console.error('Failed to start learning session:', error);
      return { success: false, error: 'Failed to start learning session' };
    }
  }

  private async getNextQuestion(): Promise<Question | null> {
    if (!this.currentSession || !this.currentDomain) return null;

    try {
      const userModel = this.userModeling.getUserModel();
      if (!userModel) return null;

      // Get focus areas
      const focusAreas = await this.getCurrentFocusAreas();
      if (focusAreas.length === 0) return null;

      // Select topic based on priority
      const selectedTopic = focusAreas[0];
      const difficulty = this.userModeling.recommendDifficulty(selectedTopic, this.currentDomain);

      // Generate question
      const userContext = {
        knowledgeLevel: userModel.knowledgeState[selectedTopic] || 0.5,
        preferredLearningStyle: this.getDominantLearningStyle(userModel),
        recentTopics: Array.from(this.currentSession.topicsCovered)
      };

      const question = await contentGenerator.generateQuestion(
        this.currentDomain,
        selectedTopic,
        difficulty,
        'mcq', // Default to MCQ for now
        userContext
      );

      // Update session with current question
      this.currentSession.currentQuestion = question;
      this.currentSession.topicsCovered.add(selectedTopic);

      return question;
    } catch (error) {
      console.error('Error getting next question:', error);
      return null;
    }
  }

  private async getCurrentFocusAreas(): Promise<string[]> {
    if (!this.currentDomain) return [];

    const domainConfig = config.getDomainConfig(this.currentDomain);
    if (!domainConfig) return [];

    const userModel = this.userModeling.getUserModel();
    if (!userModel) return domainConfig.topics.slice(0, 3);

    // Get topics sorted by need for improvement
    const topicPriorities = domainConfig.topics.map(topic => {
      const knowledgeProb = userModel.knowledgeState[topic] || 0.5;
      const priority = 1.0 - knowledgeProb; // Higher priority for lower knowledge
      return { topic, priority };
    });

    // Sort by priority and return top 3
    return topicPriorities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(item => item.topic);
  }

  private getDominantLearningStyle(userModel: any): string {
    if (!userModel.learningStyleScores) return 'mixed';

    const scores = userModel.learningStyleScores;
    const maxScore = Math.max(...Object.values(scores));
    const dominantStyle = Object.keys(scores).find(key => scores[key] === maxScore);
    return dominantStyle || 'mixed';
  }

  private recommendStudyTime(): number {
    const userModel = this.userModeling.getUserModel();
    if (!userModel) return 45;

    const attentionSpan = userModel.attentionSpan || 25;
    const cognitiveCapacity = userModel.cognitiveLoadCapacity || 0.7;

    // Base recommendation on attention span and cognitive capacity
    const baseTime = Math.min(attentionSpan * 2, 90); // Max 90 minutes
    const adjustedTime = baseTime * cognitiveCapacity;

    return Math.max(15, Math.min(120, Math.round(adjustedTime))); // Between 15 and 120 minutes
  }

  async submitAnswer(
    questionId: string,
    answer: string,
    responseTime: number,
    confidence: number = 0.5
  ): Promise<{
    success: boolean;
    feedback?: SessionFeedback;
    error?: string;
  }> {
    if (!this.currentSession || !this.currentSession.currentQuestion) {
      return { success: false, error: 'No active learning session or question' };
    }

    try {
      const question = this.currentSession.currentQuestion;
      const isCorrect = this.evaluateAnswer(answer, question);

      // Create interaction record
      const interaction: Omit<UserInteraction, 'id'> = {
        userId: this.userId,
        timestamp: Date.now(),
        domain: this.currentDomain!,
        topic: question.topic,
        questionId: questionId,
        difficultyLevel: question.difficulty,
        responseTime: responseTime,
        isCorrect,
        hintUsed: false, // TODO: Track hint usage
        attempts: 1, // TODO: Track attempts
        confidenceScore: confidence,
        sessionId: this.currentSession.sessionId
      };

      // Add interaction to user model
      await this.userModeling.addInteraction(interaction);

      // Update session stats
      this.currentSession.questionsAnswered++;
      if (isCorrect) {
        this.currentSession.correctAnswers++;
      }
      this.currentSession.totalTimeSpent += responseTime / 60.0; // Convert to minutes

      // Get next question
      const nextQuestion = await this.getNextQuestion();

      // Prepare feedback
      const feedback: SessionFeedback = {
        isCorrect,
        explanation: question.explanation || 'Good work!',
        hints: isCorrect ? [] : question.hints || [],
        knowledgeUpdate: (await this.userModeling.predictKnowledgeProbability(question.topic)) || 0.5,
        sessionProgress: this.getSessionProgress(),
        nextQuestion: nextQuestion || undefined,
        continueSession: nextQuestion !== null
      };

      return {
        success: true,
        feedback
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      return { success: false, error: 'Failed to process answer' };
    }
  }

  private evaluateAnswer(userAnswer: string, question: Question): boolean {
    if (question.questionType === 'mcq') {
      return userAnswer.toUpperCase().trim() === question.correctAnswer.toUpperCase().trim();
    } else {
      // For subjective questions, would need more sophisticated evaluation
      // Could use AI for evaluation or keyword matching
      return userAnswer.trim().length > 10; // Simplified check
    }
  }

  private getSessionProgress(): SessionFeedback['sessionProgress'] {
    if (!this.currentSession) {
      return {
        questionsAnswered: 0,
        accuracy: 0,
        sessionDurationMinutes: 0,
        topicsCovered: 0,
        estimatedRemainingTime: 0
      };
    }

    const sessionDuration = (Date.now() - this.currentSession.startTime.getTime()) / (1000 * 60);
    const accuracy = this.currentSession.questionsAnswered > 0 
      ? this.currentSession.correctAnswers / this.currentSession.questionsAnswered 
      : 0;

    return {
      questionsAnswered: this.currentSession.questionsAnswered,
      accuracy,
      sessionDurationMinutes: sessionDuration,
      topicsCovered: this.currentSession.topicsCovered.size,
      estimatedRemainingTime: Math.max(0, this.recommendStudyTime() - sessionDuration)
    };
  }

  async endSession(): Promise<{
    success: boolean;
    sessionSummary?: any;
    insights?: string[];
    achievements?: any[];
    error?: string;
  }> {
    if (!this.currentSession) {
      return { success: false, error: 'No active session to end' };
    }

    try {
      const endTime = new Date();
      this.currentSession.endTime = endTime;
      this.currentSession.sessionState = 'completed';

      const sessionSummary = {
        sessionId: this.currentSession.sessionId,
        durationMinutes: (endTime.getTime() - this.currentSession.startTime.getTime()) / (1000 * 60),
        questionsAnswered: this.currentSession.questionsAnswered,
        accuracy: this.currentSession.correctAnswers / Math.max(1, this.currentSession.questionsAnswered),
        topicsCovered: Array.from(this.currentSession.topicsCovered),
        domain: this.currentDomain,
        endedAt: endTime.toISOString()
      };

      // Save completed session
      await storageManager.saveLearningSession(this.currentSession);

      // Generate insights
      const insights = this.generateSessionInsights(sessionSummary);

      // Check for achievements
      const achievements = this.checkSessionAchievements(sessionSummary);

      // Clear current session
      this.currentSession = null;

      return {
        success: true,
        sessionSummary,
        insights,
        achievements
      };
    } catch (error) {
      console.error('Error ending session:', error);
      return { success: false, error: 'Failed to end session' };
    }
  }

  private generateSessionInsights(sessionSummary: any): string[] {
    const insights: string[] = [];

    const accuracy = sessionSummary.accuracy;
    if (accuracy > 0.8) {
      insights.push("Excellent performance! You're mastering the material.");
    } else if (accuracy > 0.6) {
      insights.push("Good progress! Keep practicing to improve further.");
    } else {
      insights.push("Focus on understanding concepts before attempting more problems.");
    }

    const duration = sessionSummary.durationMinutes;
    if (duration > 60) {
      insights.push("Long study session! Remember to take breaks to maintain focus.");
    } else if (duration < 10) {
      insights.push("Short session today. Try to study for longer periods when possible.");
    }

    const topicsCount = sessionSummary.topicsCovered.length;
    if (topicsCount > 3) {
      insights.push("You covered many topics today. Focus on fewer topics for deeper understanding.");
    }

    return insights;
  }

  private checkSessionAchievements(sessionSummary: any): any[] {
    const achievements: any[] = [];

    // Perfect score achievement
    if (sessionSummary.accuracy === 1.0 && sessionSummary.questionsAnswered >= 5) {
      achievements.push({
        id: 'perfect_session',
        name: 'Perfect Session',
        description: 'Got all questions right in a session!',
        icon: '🎯'
      });
    }

    // Marathon session achievement
    if (sessionSummary.durationMinutes > 90) {
      achievements.push({
        id: 'marathon_session',
        name: 'Marathon Learner',
        description: 'Studied for over 90 minutes straight!',
        icon: '🏃‍♂️'
      });
    }

    return achievements;
  }

  async getUserAnalytics(): Promise<any> {
    return await this.userModeling.getUserAnalytics();
  }

  async exportUserData(): Promise<any> {
    return await this.userModeling.exportUserData();
  }

  async clearUserData(): Promise<void> {
    await this.userModeling.clearUserData();
    this.currentSession = null;
    this.currentDomain = null;
  }

  getCurrentSession(): LearningSession | null {
    return this.currentSession;
  }

  getCurrentDomain(): string | null {
    return this.currentDomain;
  }

  isReady(): boolean {
    return this.isInitialized && this.userModeling.isReady();
  }
}
