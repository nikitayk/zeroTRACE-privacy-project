// zeroTrace AI Adaptive Study Engine - Privacy-First Implementation
import { StudyProfile, StudyPlan, Session, StudyBlock, StudyPreferences } from './types';

export const STUDY_CONFIG = {
  dailyTargetMinutes: 90,
  maxFocusSession: 45,
  minStudyBlock: 15,
  difficultyLevels: ['easy', 'medium', 'hard', 'expert'],
  skillDomains: {
    'dsa': ['arrays', 'linkedlists', 'trees', 'graphs', 'dp', 'greedy', 'backtracking'],
    'programming': ['cpp', 'python', 'java', 'javascript'],
    'algorithms': ['sorting', 'searching', 'optimization', 'string-algorithms'],
    'system-design': ['scalability', 'databases', 'caching', 'load-balancing']
  },
  proficiencyLevels: {
    beginner: { min: 0, max: 100, label: '🌱 Beginner' },
    basic: { min: 101, max: 200, label: '⚡️ Basic' },
    intermediate: { min: 201, max: 300, label: '🚀 Intermediate' },
    advanced: { min: 301, max: 400, label: '🎯 Advanced' },
    master: { min: 401, max: 500, label: '👑 Master' }
  }
};

export function getCurrentTimestamp(): number {
  return Date.now();
}

export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

export function calculateSkillScore(skill: string, recentSessions: Session[] = []): number {
  if (!recentSessions.length) return 50; // Default starting score

  const relevantSessions = recentSessions.filter(s => s.skill === skill);

  if (!relevantSessions.length) return 50;

  // Calculate weighted score based on recency and performance
  const scores = relevantSessions.map(session => {
    const recencyWeight = Math.exp(-(getCurrentTimestamp() - session.timestamp) / (24 * 60 * 60 * 1000));
    const performanceScore = session.success ? session.difficulty * 25 : session.difficulty * 10;
    return performanceScore * recencyWeight;
  });

  return Math.min(500, Math.max(0, scores.reduce((a, b) => a + b, 0) / scores.length));
}

export function identifyWeakAreas(userProfile: StudyProfile): { skill: string, score: number, priority: string }[] {
  const { skillScores = {}, preferences = {} as StudyPreferences } = userProfile;
  const weakSkills: { skill: string, score: number, priority: string }[] = [];

  Object.entries(skillScores).forEach(([skill, score]) => {
    if (score < 150) { // Below basic level
      weakSkills.push({ skill, score, priority: 'high' });
    } else if (score < 250) { // Below intermediate
      weakSkills.push({ skill, score, priority: 'medium' });
    }
  });

  return weakSkills.sort((a, b) => a.score - b.score);
}

export function generateStudyPlan(userProfile: StudyProfile, preferences: StudyPreferences): StudyPlan {
  const targetMinutes = preferences.dailyTarget || STUDY_CONFIG.dailyTargetMinutes;
  const weakAreas = identifyWeakAreas(userProfile);
  const studyBlocks: StudyBlock[] = [];

  // Distribute time across weak areas and review
  let remainingTime = targetMinutes;
  const reviewTime = Math.min(20, targetMinutes * 0.2); // 20% for review
  remainingTime -= reviewTime;

  // Create focused study blocks
  weakAreas.slice(0, 3).forEach((area, index) => {
    const blockTime = Math.min(
      STUDY_CONFIG.maxFocusSession,
      Math.floor(remainingTime / (weakAreas.length - index))
    );

    if (blockTime >= STUDY_CONFIG.minStudyBlock) {
      studyBlocks.push({
        id: `block_${getCurrentTimestamp()}_${index}`,
        skill: area.skill,
        duration: blockTime,
        difficulty: area.score < 100 ? 'easy' : area.score < 200 ? 'medium' : 'hard',
        type: 'focused_practice',
        resources: generateResourceSuggestions(area.skill),
        startTime: null,
        completed: false
      });
      remainingTime -= blockTime;
    }
  });

  // Add review block
  if (reviewTime >= STUDY_CONFIG.minStudyBlock) {
    studyBlocks.push({
      id: `review_${getCurrentTimestamp()}`,
      skill: 'mixed_review',
      duration: reviewTime,
      difficulty: 'mixed',
      type: 'review',
      resources: ['Previous problems', 'Concept revision'],
      startTime: null,
      completed: false
    });
  }

  return {
    id: `plan_${getCurrentTimestamp()}`,
    createdAt: getCurrentTimestamp(),
    targetMinutes,
    blocks: studyBlocks,
    totalPlanned: studyBlocks.reduce((sum, block) => sum + block.duration, 0),
    estimatedCompletion: new Date(getCurrentTimestamp() + minutesToMs(targetMinutes)).toISOString()
  };
}

function generateResourceSuggestions(skill: string): string[] {
  const resourceMap: { [key: string]: string[] } = {
    'arrays': ['Two Pointers', 'Sliding Window', 'Array Manipulation'],
    'linkedlists': ['Fast/Slow Pointers', 'Reversal Patterns', 'Merge Techniques'],
    'trees': ['DFS Traversal', 'BFS Traversal', 'Tree Construction'],
    'graphs': ['Graph Traversal', 'Shortest Path', 'Topological Sort'],
    'dp': ['1D DP', '2D DP', 'State Machines'],
    'greedy': ['Interval Problems', 'Optimization', 'Priority Queues']
  };

  return resourceMap[skill] || ['Practice Problems', 'Concept Review'];
}

export function updateUserProgress(userProfile: StudyProfile, sessionData: Partial<Session>): StudyProfile {
    const updatedProfile = { ...userProfile };
    const { skill, success, difficulty, duration, problemsCompleted } = sessionData;

    // Update skill scores
    if (skill && success !== undefined && difficulty !== undefined) {
        if (!updatedProfile.skillScores) updatedProfile.skillScores = {};
        const currentScore = updatedProfile.skillScores[skill] || 50;
        const improvement = success ? difficulty * 5 + Math.min(10, (problemsCompleted || 0) * 2) : -5;
        updatedProfile.skillScores[skill] = Math.max(0, Math.min(500, currentScore + improvement));
    }

    // Update session history
    if (!updatedProfile.sessionHistory) updatedProfile.sessionHistory = [];
    updatedProfile.sessionHistory.push({
        ...sessionData,
        id: `session_${getCurrentTimestamp()}`,
        timestamp: getCurrentTimestamp(),
        success: sessionData.success || false,
        difficulty: sessionData.difficulty || 1,
        skill: sessionData.skill || 'unknown'
    } as Session);

    // Keep only last 50 sessions for privacy
    updatedProfile.sessionHistory = updatedProfile.sessionHistory.slice(-50);

    // Update statistics
    if (!updatedProfile.stats) updatedProfile.stats = { totalStudyTime: 0, problemsSolved: 0, streak: 0, longestStreak: 0, lastActive: 0 };
    updatedProfile.stats.totalStudyTime = (updatedProfile.stats.totalStudyTime || 0) + (duration || 0);
    updatedProfile.stats.problemsSolved = (updatedProfile.stats.problemsSolved || 0) + (problemsCompleted || 0);
    updatedProfile.stats.lastActive = getCurrentTimestamp();

    return updatedProfile;
}

export function getNextRecommendation(userProfile: StudyProfile): StudyBlock | null {
    const weakAreas = identifyWeakAreas(userProfile);
    const strongAreas = Object.entries(userProfile.skillScores || {})
        .filter(([, score]) => score > 350)
        .sort((a, b) => b[1] - a[1]);

    // 1. High-priority weak area
    if (weakAreas.length > 0 && weakAreas[0].priority === 'high') {
        const area = weakAreas[0];
        return {
            id: `rec_improve_${area.skill}`,
            skill: area.skill,
            duration: 25,
            difficulty: 'medium',
            type: 'improvement',
            resources: generateResourceSuggestions(area.skill),
            startTime: null,
            completed: false
        };
    }

    // 2. Maintenance of a strong skill
    if (strongAreas.length > 0) {
        const [skill] = strongAreas[0];
        return {
            id: `rec_maintain_${skill}`,
            skill: skill,
            duration: 15,
            difficulty: 'hard',
            type: 'maintenance',
            resources: generateResourceSuggestions(skill),
            startTime: null,
            completed: false
        };
    }

    // 3. Medium-priority weak area
    const mediumWeakness = weakAreas.find(a => a.priority === 'medium');
    if (mediumWeakness) {
        return {
            id: `rec_improve_${mediumWeakness.skill}`,
            skill: mediumWeakness.skill,
            duration: 20,
            difficulty: 'easy',
            type: 'improvement',
            resources: generateResourceSuggestions(mediumWeakness.skill),
            startTime: null,
            completed: false
        };
    }

    return null; // No recommendation if profile is balanced
}

// Privacy-first utilities
export function sanitizeUserData(userData: any): any {
  // Remove any potentially identifying information while keeping learning data
  const sanitized = { ...userData };
  delete sanitized.email;
  delete sanitized.name;
  delete sanitized.deviceInfo;
  return sanitized;
}

export function compressSessionHistory(sessions: Session[]): Partial<Session>[] {
  // Compress old session data to save storage space while preserving learning insights
  return sessions.map(({ id, timestamp, skill, success, difficulty }) => ({
    id, timestamp, skill, success, difficulty
  }));
}
