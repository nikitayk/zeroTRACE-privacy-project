// Main Learning Interface for Adaptive Learning System
import { config, loadConfigFromStorage, saveConfigToStorage } from './config.js';
import { UserModel, UserInteraction } from './userModeling.js';
import { AIContentGenerator, contentManager } from './contentGeneration.js';

class LearningState {
  constructor(userId, currentTopic, currentDomain, knowledgeLevel, difficultyLevel, timeSpentToday, consecutiveCorrect, consecutiveIncorrect, engagementScore, energyLevel, sessionLength) {
    this.userId = userId;
    this.currentTopic = currentTopic;
    this.currentDomain = currentDomain;
    this.knowledgeLevel = knowledgeLevel; // 0-1
    this.difficultyLevel = difficultyLevel;
    this.timeSpentToday = timeSpentToday; // minutes
    this.consecutiveCorrect = consecutiveCorrect;
    this.consecutiveIncorrect = consecutiveIncorrect;
    this.engagementScore = engagementScore; // 0-1
    this.energyLevel = energyLevel; // 0-1 (decreases with time, resets daily)
    this.sessionLength = sessionLength; // minutes
  }

  toFeatureVector() {
    const difficultyEncoding = {
      'beginner': [1, 0, 0, 0],
      'intermediate': [0, 1, 0, 0],
      'advanced': [0, 0, 1, 0],
      'expert': [0, 0, 0, 1]
    };

    const features = [
      this.knowledgeLevel,
      this.timeSpentToday / 120.0, // Normalize to 2 hours
      this.consecutiveCorrect / 10.0, // Normalize
      this.consecutiveIncorrect / 5.0, // Normalize
      this.engagementScore,
      this.energyLevel,
      this.sessionLength / 60.0 // Normalize to 1 hour
    ];

    // Add difficulty encoding
    features.push(...(difficultyEncoding[this.difficultyLevel] || [0, 1, 0, 0]));

    return features;
  }
}

class AdaptiveLearningInterface {
  constructor(userId) {
    this.userId = userId;
    this.userModel = new UserModel(userId);
    this.currentDomain = null;
    this.contentGenerator = new AIContentGenerator();
    this.sessionActive = false;
    this.currentSession = {
      startTime: null,
      questionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0.0,
      topicsCovered: new Set(),
      sessionId: null
    };
  }

  async initialize() {
    try {
      // Load configuration from storage
      await loadConfigFromStorage();
      
      // Load user data from storage
      await this.loadUserData();
      
      console.log(`Initialized adaptive learning interface for user ${this.userId}`);
    } catch (error) {
      console.error('Error initializing interface:', error);
      throw error;
    }
  }

  async loadUserData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([`userData_${this.userId}`], (result) => {
        if (result[`userData_${this.userId}`]) {
          const userData = result[`userData_${this.userId}`];
          
          // Restore user model data
          this.userModel.knowledgeState = userData.knowledgeState || {};
          this.userModel.learningStyleScores = userData.learningStyleScores || { visual: 0.5, auditory: 0.5, kinesthetic: 0.5, reading: 0.5 };
          this.userModel.cognitiveLoadCapacity = userData.cognitiveLoadCapacity || 0.7;
          this.userModel.motivationLevel = userData.motivationLevel || 0.8;
          this.userModel.attentionSpan = userData.attentionSpan || 25.0;
          
          // Restore interaction history
          if (userData.interactionsHistory) {
            this.userModel.interactionsHistory = userData.interactionsHistory.map(i => 
              new UserInteraction(
                i.timestamp, i.domain, i.topic, i.questionId, i.difficultyLevel,
                i.responseTime, i.isCorrect, i.hintUsed, i.attempts, i.confidenceScore
              )
            );
          }
          
          console.log('Loaded user data from storage');
        }
        resolve();
      });
    });
  }

  async saveUserData() {
    return new Promise((resolve) => {
      const userData = {
        knowledgeState: this.userModel.knowledgeState,
        learningStyleScores: this.userModel.learningStyleScores,
        cognitiveLoadCapacity: this.userModel.cognitiveLoadCapacity,
        motivationLevel: this.userModel.motivationLevel,
        attentionSpan: this.userModel.attentionSpan,
        interactionsHistory: this.userModel.interactionsHistory.map(i => ({
          timestamp: i.timestamp,
          domain: i.domain,
          topic: i.topic,
          questionId: i.questionId,
          difficultyLevel: i.difficultyLevel,
          responseTime: i.responseTime,
          isCorrect: i.isCorrect,
          hintUsed: i.hintUsed,
          attempts: i.attempts,
          confidenceScore: i.confidenceScore
        }))
      };

      chrome.storage.local.set({
        [`userData_${this.userId}`]: userData
      }, () => {
        console.log('Saved user data to storage');
        resolve();
      });
    });
  }

  getAvailableDomains() {
    const domains = [];
    for (const [domainId, domainConfig] of Object.entries(config.learningDomains)) {
      domains.push({
        id: domainId,
        name: domainConfig.displayName,
        description: domainConfig.description,
        topics: domainConfig.topics,
        userProgress: this.getDomainProgress(domainId)
      });
    }
    return domains;
  }

  getDomainProgress(domainId) {
    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) {
      return { overallProgress: 0.0, topicsMastered: 0, totalTopics: 0 };
    }

    const topics = domainConfig.topics;
    let masteredCount = 0;
    let totalProgress = 0.0;

    for (const topic of topics) {
      const knowledgeProb = this.userModel.knowledgeState[topic] || 0.0;
      totalProgress += knowledgeProb;
      if (knowledgeProb > 0.85) { // Mastery threshold
        masteredCount += 1;
      }
    }

    return {
      overallProgress: topics.length > 0 ? totalProgress / topics.length : 0.0,
      topicsMastered: masteredCount,
      totalTopics: topics.length,
      domainInteractions: this.userModel.interactionsHistory.filter(i => i.domain === domainId).length
    };
  }

  async selectDomain(domainId) {
    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) {
      return { success: false, error: 'Invalid domain selected' };
    }

    this.currentDomain = domainId;

    // Get personalized domain introduction
    const domainProgress = this.getDomainProgress(domainId);
    const recommendations = await this.getDomainRecommendations(domainId);

    return {
      success: true,
      domain: {
        id: domainId,
        name: domainConfig.displayName,
        description: domainConfig.description
      },
      progress: domainProgress,
      recommendations: recommendations,
      nextSteps: await this.getSuggestedNextSteps(domainId)
    };
  }

  async getDomainRecommendations(domainId) {
    try {
      const userAnalytics = this.userModel.getLearningAnalytics();

      // Identify focus areas
      const strugglingTopics = Object.entries(this.userModel.knowledgeState)
        .filter(([topic, prob]) => prob < 0.3)
        .map(([topic]) => topic);
      const masteredTopics = Object.entries(this.userModel.knowledgeState)
        .filter(([topic, prob]) => prob > 0.85)
        .map(([topic]) => topic);

      const recommendations = {
        focusAreas: strugglingTopics.slice(0, 3),
        masteredAreas: masteredTopics,
        suggestedDifficulty: this.suggestOverallDifficulty(),
        studyTimeRecommendation: this.recommendStudyTime(),
        learningStyleTips: this.getLearningStyleTips()
      };

      return recommendations;

    } catch (error) {
      console.error('Error getting domain recommendations:', error);
      return {
        focusAreas: [],
        masteredAreas: [],
        suggestedDifficulty: 'intermediate',
        studyTimeRecommendation: 45,
        learningStyleTips: ['Practice regularly', 'Review mistakes']
      };
    }
  }

  suggestOverallDifficulty() {
    if (Object.keys(this.userModel.knowledgeState).length === 0) {
      return 'intermediate';
    }

    const avgKnowledge = Object.values(this.userModel.knowledgeState).reduce((sum, prob) => sum + prob, 0) / Object.keys(this.userModel.knowledgeState).length;

    if (avgKnowledge < 0.3) return 'beginner';
    else if (avgKnowledge < 0.6) return 'intermediate';
    else if (avgKnowledge < 0.85) return 'advanced';
    else return 'expert';
  }

  recommendStudyTime() {
    const attentionSpan = this.userModel.attentionSpan;
    const cognitiveCapacity = this.userModel.cognitiveLoadCapacity;

    // Base recommendation on attention span and cognitive capacity
    const baseTime = Math.min(attentionSpan * 2, 90); // Max 90 minutes
    const adjustedTime = baseTime * cognitiveCapacity;

    return Math.max(15, Math.min(120, Math.floor(adjustedTime))); // Between 15 and 120 minutes
  }

  getLearningStyleTips() {
    const styleScores = this.userModel.learningStyleScores;
    const dominantStyle = Object.entries(styleScores).reduce((a, b) => styleScores[a[0]] > styleScores[b[0]] ? a : b)[0];

    const tipsMap = {
      visual: [
        'Use diagrams and flowcharts to understand concepts',
        'Create mind maps for complex topics',
        'Watch video tutorials and visual demonstrations'
      ],
      auditory: [
        'Listen to explanations and discussions',
        'Practice explaining concepts out loud',
        'Use mnemonic devices and verbal repetition'
      ],
      kinesthetic: [
        'Practice hands-on exercises and implementations',
        'Take breaks and move around while studying',
        'Use physical manipulatives when possible'
      ],
      reading: [
        'Read comprehensive explanations and documentation',
        'Take detailed notes while learning',
        'Create written summaries of key concepts'
      ]
    };

    return tipsMap[dominantStyle] || [
      'Practice regularly with varied exercises',
      'Review and reinforce learned concepts',
      'Seek feedback on your progress'
    ];
  }

  async getSuggestedNextSteps(domainId) {
    const domainConfig = config.getDomainConfig(domainId);
    if (!domainConfig) {
      return [];
    }

    const nextSteps = [];

    // Find topics to focus on
    for (const topic of domainConfig.topics.slice(0, 5)) { // Top 5 topics
      const knowledgeProb = this.userModel.knowledgeState[topic] || 0.0;
      const difficulty = this.userModel.recommendDifficulty(topic, domainId);

      if (knowledgeProb < 0.85) { // Not mastered yet
        nextSteps.push({
          type: 'practice',
          topic: topic,
          difficulty: difficulty,
          estimatedTime: 15 + (difficulty === 'advanced' ? 5 : 0) + (difficulty === 'expert' ? 10 : 0),
          description: `Practice ${topic.replace('_', ' ')} at ${difficulty} level`,
          priority: 1.0 - knowledgeProb // Higher priority for lower knowledge
        });
      }
    }

    // Sort by priority
    nextSteps.sort((a, b) => b.priority - a.priority);
    return nextSteps.slice(0, 3);
  }

  async startLearningSession() {
    if (!this.currentDomain) {
      return { success: false, error: 'No domain selected' };
    }

    const sessionId = `session_${this.userId}_${Date.now()}`;
    this.currentSession = {
      sessionId: sessionId,
      startTime: new Date(),
      questionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0.0,
      topicsCovered: new Set(),
      domain: this.currentDomain
    };

    this.sessionActive = true;

    // Get first question
    const firstQuestion = await this.getNextQuestion();

    return {
      success: true,
      sessionId: sessionId,
      question: firstQuestion ? this.questionToDict(firstQuestion) : null,
      sessionInfo: {
        domain: this.currentDomain,
        estimatedSessionLength: this.recommendStudyTime(),
        focusAreas: await this.getCurrentFocusAreas()
      }
    };
  }

  async getCurrentFocusAreas() {
    const domainConfig = config.getDomainConfig(this.currentDomain);
    if (!domainConfig) {
      return [];
    }

    // Get topics sorted by need for improvement
    const topicPriorities = [];
    for (const topic of domainConfig.topics) {
      const knowledgeProb = this.userModel.knowledgeState[topic] || 0.5;
      const recentPerformance = this.userModel.getRecentTopicPerformance(topic);
      const priority = (1.0 - knowledgeProb) * 0.7 + (1.0 - recentPerformance) * 0.3;
      topicPriorities.push({ topic, priority });
    }

    // Sort by priority and return top 3
    topicPriorities.sort((a, b) => b.priority - a.priority);
    return topicPriorities.slice(0, 3).map(tp => tp.topic);
  }

  async getNextQuestion() {
    try {
      // Get current focus areas
      const focusAreas = await this.getCurrentFocusAreas();
      
      if (focusAreas.length === 0) {
        return null;
      }

      // Select topic based on priority
      const selectedTopic = focusAreas[0];
      const difficulty = this.userModel.recommendDifficulty(selectedTopic, this.currentDomain);
      
      // Try to get from cache first
      let question = contentManager.getCachedQuestion(
        this.currentDomain, selectedTopic, difficulty, 'mcq'
      );

      if (!question) {
        // Generate new question
        const userContext = {
          knowledgeLevel: this.userModel.knowledgeState[selectedTopic] || 0.5,
          preferredLearningStyle: Object.entries(this.userModel.learningStyleScores)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0],
          recentTopics: Array.from(this.currentSession.topicsCovered)
        };

        question = await this.contentGenerator.generateQuestion(
          this.currentDomain,
          selectedTopic,
          difficulty,
          'mcq',
          userContext
        );

        // Cache for future use
        contentManager.cacheQuestion(question);
      }

      return question;

    } catch (error) {
      console.error('Error getting next question:', error);
      return this.getFallbackQuestion();
    }
  }

  getFallbackQuestion() {
    const domainConfig = config.getDomainConfig(this.currentDomain);
    if (!domainConfig) {
      return null;
    }

    // Simple strategy: pick topic with lowest knowledge
    const topicScores = {};
    for (const topic of domainConfig.topics) {
      topicScores[topic] = this.userModel.knowledgeState[topic] || 0.5;
    }

    const weakestTopic = Object.entries(topicScores)
      .reduce((a, b) => a[1] < b[1] ? a : b)[0];
    const difficulty = this.userModel.recommendDifficulty(weakestTopic, this.currentDomain);

    return {
      id: `fallback_${weakestTopic}_${Date.now()}`,
      domain: this.currentDomain,
      topic: weakestTopic,
      difficulty: difficulty,
      questionType: 'mcq',
      questionText: `Explain the key concepts of ${weakestTopic} at ${difficulty} level.`,
      options: [],
      correctAnswer: '',
      explanation: 'This is a fallback question. Please provide a detailed explanation.',
      hints: [],
      estimatedTime: 5.0
    };
  }

  questionToDict(question) {
    return {
      id: question.id,
      domain: question.domain,
      topic: question.topic,
      difficulty: question.difficulty,
      questionType: question.questionType,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hints: question.hints,
      estimatedTime: question.estimatedTime
    };
  }

  async submitAnswer(questionId, answer, responseTime, confidence = 0.5) {
    if (!this.sessionActive) {
      return { success: false, error: 'No active learning session' };
    }

    try {
      // Find question (in a real system, this would be stored)
      const question = null; // Would retrieve from storage/cache

      // Determine if answer is correct (simplified)
      const isCorrect = this.evaluateAnswer(answer, question);

      // Create interaction record
      const interaction = new UserInteraction(
        Date.now(),
        this.currentDomain,
        question ? question.topic : 'general',
        questionId,
        question ? question.difficulty : 'intermediate',
        responseTime,
        isCorrect,
        false, // hintUsed
        1, // attempts
        confidence
      );

      // Add to user model
      this.userModel.addInteraction(interaction);

      // Update session stats
      this.currentSession.questionsAnswered += 1;
      if (isCorrect) {
        this.currentSession.correctAnswers += 1;
      }
      this.currentSession.totalTimeSpent += responseTime / 60.0;
      if (question) {
        this.currentSession.topicsCovered.add(question.topic);
      }

      // Get next question
      const nextQuestion = await this.getNextQuestion();

      // Prepare feedback
      const feedback = {
        isCorrect: isCorrect,
        explanation: question ? question.explanation : 'Good work!',
        hints: question && !isCorrect ? question.hints : [],
        knowledgeUpdate: this.userModel.knowledgeState[question ? question.topic : 'general'] || 0.5,
        sessionProgress: this.getSessionProgress()
      };

      // Save user data periodically
      if (this.currentSession.questionsAnswered % 5 === 0) {
        await this.saveUserData();
      }

      return {
        success: true,
        feedback: feedback,
        nextQuestion: nextQuestion ? this.questionToDict(nextQuestion) : null,
        continueSession: nextQuestion !== null
      };

    } catch (error) {
      console.error('Error submitting answer:', error);
      return { success: false, error: 'Failed to process answer' };
    }
  }

  evaluateAnswer(userAnswer, question) {
    if (!question) {
      return true; // Default to correct for testing
    }

    if (question.questionType === 'mcq') {
      return userAnswer.toUpperCase().trim() === question.correctAnswer.toUpperCase().trim();
    } else {
      // For subjective questions, would need more sophisticated evaluation
      // Could use AI for evaluation or keyword matching
      return userAnswer.trim().length > 10; // Simplified check
    }
  }

  getSessionProgress() {
    const sessionDuration = this.currentSession.startTime ? 
      (new Date() - this.currentSession.startTime) / (1000 * 60) : 0.0;

    const accuracy = this.currentSession.questionsAnswered > 0 ? 
      this.currentSession.correctAnswers / this.currentSession.questionsAnswered : 0.0;

    return {
      questionsAnswered: this.currentSession.questionsAnswered,
      accuracy: accuracy,
      sessionDurationMinutes: sessionDuration,
      topicsCovered: this.currentSession.topicsCovered.size,
      estimatedRemainingTime: Math.max(0, this.recommendStudyTime() - sessionDuration)
    };
  }

  endSession() {
    if (!this.sessionActive) {
      return { success: false, error: 'No active session to end' };
    }

    const sessionSummary = {
      sessionId: this.currentSession.sessionId,
      durationMinutes: this.currentSession.startTime ? 
        (new Date() - this.currentSession.startTime) / (1000 * 60) : 0,
      questionsAnswered: this.currentSession.questionsAnswered,
      accuracy: this.currentSession.questionsAnswered > 0 ? 
        this.currentSession.correctAnswers / this.currentSession.questionsAnswered : 0,
      topicsCovered: Array.from(this.currentSession.topicsCovered),
      domain: this.currentDomain,
      endedAt: new Date().toISOString()
    };

    this.sessionActive = false;

    // Generate session insights
    const insights = this.generateSessionInsights(sessionSummary);

    // Save user data
    this.saveUserData();

    return {
      success: true,
      sessionSummary: sessionSummary,
      insights: insights,
      achievements: this.checkSessionAchievements(sessionSummary)
    };
  }

  generateSessionInsights(sessionSummary) {
    const insights = [];

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

  checkSessionAchievements(sessionSummary) {
    const achievements = [];

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

  getUserAnalytics() {
    return this.userModel.getLearningAnalytics();
  }

  async exportUserData() {
    return {
      userModel: this.userModel.exportUserData(),
      interfaceData: {
        currentDomain: this.currentDomain,
        sessionActive: this.sessionActive,
        currentSession: {
          ...this.currentSession,
          topicsCovered: Array.from(this.currentSession.topicsCovered),
          startTime: this.currentSession.startTime ? this.currentSession.startTime.toISOString() : null
        }
      },
      contentCache: contentManager.exportCache()
    };
  }

  clearUserData() {
    this.userModel.clearUserData();
    this.currentDomain = null;
    this.sessionActive = false;
    this.currentSession = {
      startTime: null,
      questionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0.0,
      topicsCovered: new Set(),
      sessionId: null
    };
    console.log(`Cleared all data for user ${this.userId}`);
  }
}

export { AdaptiveLearningInterface, LearningState };
