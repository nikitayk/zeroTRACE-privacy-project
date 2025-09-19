// zeroTrace AI Adaptive Study Engine - Privacy-First Implementation

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
    beginner: { min: 0, max: 100, label: '\ud83c\udf31 Beginner' },
    basic: { min: 101, max: 200, label: '\u26a1 Basic' },
    intermediate: { min: 201, max: 300, label: '\ud83d\ude80 Intermediate' },
    advanced: { min: 301, max: 400, label: '\ud83c\udfaf Advanced' },
    master: { min: 401, max: 500, label: '\ud83d\udc51 Master' }
  }
};

export function getCurrentTimestamp() {
  return Date.now();
}

export function minutesToMs(minutes) {
  return minutes * 60 * 1000;
}

export function calculateSkillScore(skill, recentSessions = []) {
  if (!recentSessions.length) return 50; // Default starting score
  
  const relevantSessions = recentSessions.filter(s => 
    s.skills?.includes(skill) || s.problemType === skill
  );
  
  if (!relevantSessions.length) return 50;
  
  // Calculate weighted score based on recency and performance
  const scores = relevantSessions.map(session => {
    const recencyWeight = Math.exp(-(getCurrentTimestamp() - session.timestamp) / (24 * 60 * 60 * 1000));
    const performanceScore = session.success ? session.difficulty * 25 : session.difficulty * 10;
    return performanceScore * recencyWeight;
  });
  
  return Math.min(500, Math.max(0, scores.reduce((a, b) => a + b, 0) / scores.length));
}

export function identifyWeakAreas(userProfile) {
  const { skillScores = {}, preferences = {} } = userProfile;
  const weakSkills = [];
  
  Object.entries(skillScores).forEach(([skill, score]) => {
    if (score < 150) { // Below basic level
      weakSkills.push({ skill, score, priority: 'high' });
    } else if (score < 250) { // Below intermediate
      weakSkills.push({ skill, score, priority: 'medium' });
    }
  });
  
  return weakSkills.sort((a, b) => a.score - b.score);
}

export function generateStudyPlan(userProfile, preferences = {}) {
  const targetMinutes = preferences.dailyTarget || STUDY_CONFIG.dailyTargetMinutes;
  const weakAreas = identifyWeakAreas(userProfile);
  const studyBlocks = [];
  
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

function generateResourceSuggestions(skill) {
  const resourceMap = {
    'arrays': ['Two Pointers', 'Sliding Window', 'Array Manipulation'],
    'linkedlists': ['Fast/Slow Pointers', 'Reversal Patterns', 'Merge Techniques'],
    'trees': ['DFS Traversal', 'BFS Traversal', 'Tree Construction'],
    'graphs': ['Graph Traversal', 'Shortest Path', 'Topological Sort'],
    'dp': ['1D DP', '2D DP', 'State Machines'],
    'greedy': ['Interval Problems', 'Optimization', 'Priority Queues']
  };
  
  return resourceMap[skill] || ['Practice Problems', 'Concept Review'];
}

export function updateUserProgress(userProfile, sessionData) {
  const updatedProfile = { ...userProfile };
  const { skill, success, difficulty, timeSpent, problemsSolved } = sessionData;
  
  // Update skill scores
  if (!updatedProfile.skillScores) updatedProfile.skillScores = {};
  const currentScore = updatedProfile.skillScores[skill] || 50;
  const improvement = success ? difficulty * 5 + Math.min(10, problemsSolved * 2) : -5;
  updatedProfile.skillScores[skill] = Math.max(0, Math.min(500, currentScore + improvement));
  
  // Update session history
  if (!updatedProfile.sessionHistory) updatedProfile.sessionHistory = [];
  updatedProfile.sessionHistory.push({
    ...sessionData,
    timestamp: getCurrentTimestamp()
  });
  
  // Keep only last 50 sessions for privacy
  updatedProfile.sessionHistory = updatedProfile.sessionHistory.slice(-50);
  
  // Update statistics
  if (!updatedProfile.stats) updatedProfile.stats = {};
  updatedProfile.stats.totalStudyTime = (updatedProfile.stats.totalStudyTime || 0) + timeSpent;
  updatedProfile.stats.problemsSolved = (updatedProfile.stats.problemsSolved || 0) + problemsSolved;
  updatedProfile.stats.lastActive = getCurrentTimestamp();
  
  return updatedProfile;
}

export function getNextRecommendation(userProfile) {
  const weakAreas = identifyWeakAreas(userProfile);
  if (!weakAreas.length) {
    return {
      type: 'maintenance',
      message: 'Great progress! Try some advanced problems or explore new topics.',
      suggestedSkill: 'system-design',
      difficulty: 'hard'
    };
  }
  
  const topWeakArea = weakAreas[0];
  return {
    type: 'improvement',
    message: `Focus on ${topWeakArea.skill} - your weakest area currently.`,
    suggestedSkill: topWeakArea.skill,
    difficulty: topWeakArea.score < 100 ? 'easy' : 'medium',
    estimatedTime: 25
  };
}

// Privacy-first utilities
export function sanitizeUserData(userData) {
  // Remove any potentially identifying information while keeping learning data
  const sanitized = { ...userData };
  delete sanitized.email;
  delete sanitized.name; 
  delete sanitized.deviceInfo;
  return sanitized;
}

export function compressSessionHistory(sessions) {
  // Compress old session data to save storage space while preserving learning insights
  return sessions.map(session => ({
    skill: session.skill,
    success: session.success,
    difficulty: session.difficulty,
    timestamp: session.timestamp
  }));
}


