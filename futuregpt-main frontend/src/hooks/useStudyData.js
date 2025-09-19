import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  stats: 'zt_study_stats',
  progress: 'zt_dsa_progress',
  sessions: 'zt_session_history',
  daily: 'zt_daily_tracking',
  achievements: 'zt_achievements_earned',
  settings: 'zt_study_settings'
};

const MOCK_DATA = {
  stats: {
    streak: 0,
    problemsSolved: 0,
    studyTime: '0h',
    totalMinutes: 0,
    lastActive: null,
    joinedDate: Date.now()
  },
  progress: {
    'arrays': 0,
    'strings': 0,
    'linkedlists': 0,
    'trees': 0,
    'graphs': 0,
    'dp': 0,
    'greedy': 0,
    'backtracking': 0
  },
  daily: {
    todayMinutes: 0,
    dailyGoal: 60,
    todayProblems: 0,
    problemGoal: 5,
    lastDate: new Date().toDateString()
  },
  sessions: [],
  achievements: []
};

const DEMO_DATA = {
  stats: {
    streak: 3,
    problemsSolved: 12,
    studyTime: '4h 30m',
    totalMinutes: 270,
    lastActive: Date.now() - (2 * 60 * 60 * 1000),
    joinedDate: Date.now() - (7 * 24 * 60 * 60 * 1000)
  },
  progress: {
    'arrays': 45,
    'strings': 30,
    'linkedlists': 60,
    'trees': 25,
    'graphs': 15,
    'dp': 35,
    'greedy': 40,
    'backtracking': 20
  },
  daily: {
    todayMinutes: 25,
    dailyGoal: 60,
    todayProblems: 2,
    problemGoal: 5,
    lastDate: new Date().toDateString()
  },
  sessions: [
    { id: 1, type: 'dsa', topic: 'arrays', duration: 20, problems: 2, success: true, timestamp: Date.now() - (3 * 60 * 60 * 1000) },
    { id: 2, type: 'review', topic: 'linkedlists', duration: 15, problems: 1, success: true, timestamp: Date.now() - (5 * 60 * 60 * 1000) }
  ],
  achievements: [
    { id: 'first_problem', name: 'First Steps', description: 'Solved your first problem', icon: '🎯', earned: Date.now() - (2 * 24 * 60 * 60 * 1000) }
  ]
};

export const useStudyData = () => {
  const [studyData, setStudyData] = useState(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  const loadStudyData = useCallback(async () => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const result = await new Promise(resolve => {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) return resolve({});
        chrome.storage.local.get(keys, resolve);
      });
      const stats = result[STORAGE_KEYS.stats] || MOCK_DATA.stats;
      const hasInteractions = (stats.problemsSolved || 0) > 0 || (stats.totalMinutes || 0) > 0;
      setHasRealData(hasInteractions);
      if (hasInteractions) {
        setStudyData({
          stats: result[STORAGE_KEYS.stats] || MOCK_DATA.stats,
          progress: result[STORAGE_KEYS.progress] || MOCK_DATA.progress,
          daily: result[STORAGE_KEYS.daily] || MOCK_DATA.daily,
          sessions: result[STORAGE_KEYS.sessions] || MOCK_DATA.sessions,
          achievements: result[STORAGE_KEYS.achievements] || MOCK_DATA.achievements
        });
      } else {
        setStudyData(DEMO_DATA);
      }
    } catch (error) {
      console.error('Error loading study data:', error);
      setStudyData(DEMO_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveStudyData = useCallback(async (newData) => {
    try {
      const dataToSave = {
        [STORAGE_KEYS.stats]: newData.stats,
        [STORAGE_KEYS.progress]: newData.progress,
        [STORAGE_KEYS.daily]: newData.daily,
        [STORAGE_KEYS.sessions]: newData.sessions.slice(-50),
        [STORAGE_KEYS.achievements]: newData.achievements
      };
      await new Promise(resolve => {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) return resolve();
        chrome.storage.local.set(dataToSave, resolve);
      });
      setStudyData(newData);
      setHasRealData(true);
    } catch (error) {
      console.error('Error saving study data:', error);
    }
  }, []);

  const formatStudyTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const recordSession = useCallback(async (sessionData) => {
    const session = {
      id: Date.now(),
      timestamp: Date.now(),
      type: sessionData.type || 'dsa',
      topic: sessionData.topic,
      duration: sessionData.duration || 0,
      problems: sessionData.problems || 0,
      success: sessionData.success ?? true,
      difficulty: sessionData.difficulty || 'medium'
    };

    const updatedData = {
      ...studyData,
      stats: {
        ...studyData.stats,
        problemsSolved: studyData.stats.problemsSolved + (session.problems || 0),
        totalMinutes: studyData.stats.totalMinutes + (session.duration || 0),
        studyTime: formatStudyTime(studyData.stats.totalMinutes + (session.duration || 0)),
        lastActive: Date.now()
      },
      progress: {
        ...studyData.progress,
        [session.topic]: (studyData.progress[session.topic] || 0) + (session.success ? 10 : 5)
      },
      sessions: [...studyData.sessions, session],
      daily: {
        ...studyData.daily,
        todayMinutes: studyData.daily.todayMinutes + (session.duration || 0),
        todayProblems: studyData.daily.todayProblems + (session.problems || 0),
        lastDate: new Date().toDateString()
      }
    };

    const today = new Date().toDateString();
    const lastActiveDate = studyData.stats.lastActive ? new Date(studyData.stats.lastActive).toDateString() : null;
    if (lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (lastActiveDate === yesterday) {
        updatedData.stats.streak = studyData.stats.streak + 1;
      } else if (!lastActiveDate) {
        updatedData.stats.streak = 1;
      } else {
        updatedData.stats.streak = 1;
      }
    }

    await saveStudyData(updatedData);
  }, [studyData, saveStudyData]);

  const checkAchievements = useCallback(async () => {
    const newAchievements = [];
    const currentAchievements = studyData.achievements.map(a => a.id);
    const achievementChecks = [
      { id: 'first_problem', name: 'First Steps', description: 'Solved your first problem', icon: '🎯', condition: () => studyData.stats.problemsSolved >= 1 },
      { id: 'problem_solver', name: 'Problem Solver', description: 'Solved 10 problems', icon: '🧮', condition: () => studyData.stats.problemsSolved >= 10 },
      { id: 'streak_week', name: 'Weekly Warrior', description: 'Maintained 7-day streak', icon: '🔥', condition: () => studyData.stats.streak >= 7 },
      { id: 'study_hour', name: 'Dedicated Learner', description: 'Completed 1 hour of study', icon: '⏱️', condition: () => studyData.stats.totalMinutes >= 60 }
    ];
    for (const achievement of achievementChecks) {
      if (!currentAchievements.includes(achievement.id) && achievement.condition()) {
        newAchievements.push({ ...achievement, earned: Date.now() });
      }
    }
    if (newAchievements.length > 0) {
      const updatedData = { ...studyData, achievements: [...studyData.achievements, ...newAchievements] };
      await saveStudyData(updatedData);
      return newAchievements;
    }
    return [];
  }, [studyData, saveStudyData]);

  const resetDailyProgress = useCallback(() => {
    const today = new Date().toDateString();
    if (studyData.daily.lastDate !== today) {
      const updatedData = { ...studyData, daily: { ...studyData.daily, todayMinutes: 0, todayProblems: 0, lastDate: today } };
      saveStudyData(updatedData);
    }
  }, [studyData, saveStudyData]);

  const getStudyPlan = useCallback(() => {
    const topics = Object.entries(studyData.progress)
      .map(([topic, progress]) => ({
        id: topic,
        title: topic.charAt(0).toUpperCase() + topic.slice(1),
        progress: Math.min(100, progress),
        difficulty: progress < 30 ? 'easy' : progress < 70 ? 'medium' : 'hard',
        isActive: false
      }))
      .sort((a, b) => a.progress - b.progress);
    if (topics.length > 0) topics[0].isActive = true;
    return topics.slice(0, 6);
  }, [studyData.progress]);

  const getRecentActivity = useCallback(() => {
    const formatTimeAgo = (timestamp) => {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} min ago`;
      return 'Just now';
    };
    return studyData.sessions.slice(-5).reverse().map(session => ({
      id: session.id,
      type: session.success ? 'success' : 'practice',
      title: session.topic.charAt(0).toUpperCase() + session.topic.slice(1),
      subtitle: `${session.problems || 0} problems • ${session.duration || 0} min`,
      time: formatTimeAgo(session.timestamp),
      icon: session.success ? '✅' : '🔄'
    }));
  }, [studyData.sessions]);

  useEffect(() => { loadStudyData(); }, [loadStudyData]);
  useEffect(() => { resetDailyProgress(); }, [resetDailyProgress]);
  useEffect(() => {
    const handleProblemSolved = (event) => {
      const { problem, success, timeSpent, difficulty } = event.detail;
      recordSession({
        type: 'dsa',
        topic: problem?.category || 'arrays',
        duration: Math.floor((timeSpent || 0) / 60000),
        problems: 1,
        success,
        difficulty
      });
    };
    document.addEventListener('zeroTrace:problemSolved', handleProblemSolved);
    return () => document.removeEventListener('zeroTrace:problemSolved', handleProblemSolved);
  }, [recordSession]);

  return {
    studyData,
    isLoading,
    hasRealData,
    recordSession,
    checkAchievements,
    getStudyPlan,
    getRecentActivity,
    loadStudyData,
    formatStudyTime
  };
};

export default useStudyData;







