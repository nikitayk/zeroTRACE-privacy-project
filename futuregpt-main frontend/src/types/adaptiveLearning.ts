// Types for Adaptive Learning System

export interface DomainProgress {
  completedTopics: number;
  totalTopics: number;
  averageAccuracy: number;
  studyStreak: number;
  lastStudied: string | null;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  userProgress: DomainProgress;
}

export interface UserInteraction {
  id: string;
  userId: string;
  domainId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
  confidence: number;
  timestamp: string;
  difficulty: string;
  topic: string;
}

export interface KnowledgeState {
  domainId: string;
  topicId: string;
  proficiency: number; // 0-1
  confidence: number; // 0-1
  lastUpdated: string;
  interactions: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface LearningStyleScores {
  visual: number; // 0-1
  auditory: number; // 0-1
  kinesthetic: number; // 0-1
  reading: number; // 0-1
}

export interface UserModel {
  userId: string;
  knowledgeStates: Record<string, KnowledgeState>;
  learningStyle: LearningStyleScores;
  cognitiveLoad: number; // 0-1
  motivation: number; // 0-1
  attentionSpan: number; // 0-1
  lastUpdated: string;
}

export interface Question {
  id: string;
  domainId: string;
  topicId: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  type: 'mcq' | 'subjective' | 'practical' | 'case_study';
  tags: string[];
  metadata: {
    estimatedTime: number;
    points: number;
    prerequisites: string[];
  };
}

export interface LearningSession {
  id: string;
  userId: string;
  domainId: string;
  startTime: string;
  endTime?: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  completedQuestions: number;
  sessionType: 'adaptive' | 'practice' | 'assessment';
  metadata: {
    difficulty: string;
    topics: string[];
    learningObjectives: string[];
  };
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  progress: number; // 0-1
  threshold: number;
  category: 'streak' | 'mastery' | 'engagement' | 'milestone';
}

export interface Analytics {
  userId: string;
  domainId?: string;
  timeRange: {
    start: string;
    end: string;
  };
  metrics: {
    totalSessions: number;
    totalQuestions: number;
    correctAnswers: number;
    averageAccuracy: number;
    averageResponseTime: number;
    studyStreak: number;
    timeSpent: number; // in minutes
    topicsMastered: number;
    progressRate: number; // questions per day
  };
  trends: {
    accuracyTrend: Array<{ date: string; value: number }>;
    timeSpentTrend: Array<{ date: string; value: number }>;
    difficultyProgression: Array<{ date: string; value: string }>;
  };
}

export interface StudyPlan {
  id: string;
  userId: string;
  domainId: string;
  title: string;
  description: string;
  objectives: string[];
  topics: Array<{
    id: string;
    name: string;
    priority: number; // 1-5
    estimatedTime: number; // in minutes
    prerequisites: string[];
    status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  }>;
  schedule: Array<{
    day: number; // 0-6 (Sunday-Saturday)
    topics: string[];
    duration: number; // in minutes
  }>;
  progress: {
    completedTopics: number;
    totalTopics: number;
    estimatedCompletion: string;
    actualCompletion?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface ContentGenerationRequest {
  domainId: string;
  topicId: string;
  difficulty: string;
  questionType: 'mcq' | 'subjective' | 'practical' | 'case_study';
  userContext: {
    knowledgeState: KnowledgeState;
    learningStyle: LearningStyleScores;
    previousQuestions: string[];
  };
  count: number;
}

export interface ContentGenerationResponse {
  success: boolean;
  questions: Question[];
  metadata: {
    generationTime: number;
    modelUsed: string;
    tokensUsed: number;
  };
  error?: string;
}

export interface AdaptiveRecommendation {
  type: 'question' | 'topic' | 'difficulty' | 'break';
  priority: number; // 1-5
  reasoning: string;
  metadata: {
    confidence: number;
    expectedOutcome: string;
    alternatives: string[];
  };
}

export interface ReinforcementLearningState {
  userId: string;
  domainId: string;
  state: {
    currentTopic: string;
    difficulty: string;
    fatigue: number; // 0-1
    engagement: number; // 0-1
    recentPerformance: number; // 0-1
  };
  actionSpace: string[];
  qValues: Record<string, number>;
  policy: Record<string, string>;
  lastUpdate: string;
}
