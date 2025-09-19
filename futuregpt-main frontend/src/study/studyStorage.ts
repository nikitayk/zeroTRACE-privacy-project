// zeroTrace AI Study Storage - Privacy-First Local Storage

const STORAGE_KEYS = {
  userProfile: 'zt_study_profile',
  studyPlan: 'zt_current_plan',
  preferences: 'zt_study_preferences',
  achievements: 'zt_achievements',
  dailyStats: 'zt_daily_stats'
};

// Storage utilities with privacy safeguards
export async function getStorageItem(key: string): Promise<any> {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key] || null);
    });
  });
}

export async function setStorageItem(key: string, value: any): Promise<boolean> {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve(true);
    });
  });
}

export async function removeStorageItem(key: string): Promise<boolean> {
  return new Promise(resolve => {
    chrome.storage.local.remove([key], () => {
      resolve(true);
    });
  });
}

// User Profile Management
export async function getUserProfile(): Promise<any> {
  const profile = await getStorageItem(STORAGE_KEYS.userProfile);
  return profile || createDefaultProfile();
}

export async function updateUserProfile(profileData: any): Promise<any> {
  const currentProfile = await getUserProfile();
  const updatedProfile = {
    ...currentProfile,
    ...profileData,
    lastUpdated: Date.now()
  };

  await setStorageItem(STORAGE_KEYS.userProfile, updatedProfile);
  return updatedProfile;
}

function createDefaultProfile(): any {
  return {
    id: `user_${Date.now()}`,
    createdAt: Date.now(),
    skillScores: {},
    sessionHistory: [],
    preferences: {
      dailyTarget: 90,
      preferredDifficulty: 'medium',
      focusAreas: ['dsa'],
      reminderEnabled: true
    },
    stats: {
      totalStudyTime: 0,
      problemsSolved: 0,
      streak: 0,
      longestStreak: 0
    },
    achievements: [],
    level: 1,
    experience: 0
  };
}

// Study Plan Management
export async function getCurrentStudyPlan(): Promise<any> {
  return await getStorageItem(STORAGE_KEYS.studyPlan);
}

export async function saveStudyPlan(plan: any): Promise<any> {
  await setStorageItem(STORAGE_KEYS.studyPlan, plan);
  return plan;
}

export async function updateStudyBlock(blockId: string, updateData: any): Promise<any> {
  const currentPlan = await getCurrentStudyPlan();
  if (!currentPlan) return null;

  const blockIndex = currentPlan.blocks.findIndex((b: any) => b.id === blockId);
  if (blockIndex === -1) return currentPlan;

  currentPlan.blocks[blockIndex] = {
    ...currentPlan.blocks[blockIndex],
    ...updateData,
    lastUpdated: Date.now()
  };

  await saveStudyPlan(currentPlan);
  return currentPlan;
}

// Progress Tracking
export async function recordStudySession(sessionData: any): Promise<any> {
  const profile = await getUserProfile();
  const updatedProfile = {
    ...profile,
    sessionHistory: [
      ...profile.sessionHistory.slice(-49), // Keep last 49 + new one = 50 max
      {
        ...sessionData,
        id: `session_${Date.now()}`,
        timestamp: Date.now()
      }
    ]
  };

  // Update stats
  updatedProfile.stats.totalStudyTime += sessionData.duration || 0;
  updatedProfile.stats.problemsSolved += sessionData.problemsCompleted || 0;
  updatedProfile.stats.lastActive = Date.now();

  // Update streak
  const today = new Date().toDateString();
  const lastActiveDate = new Date(profile.stats.lastActive || 0).toDateString();

  if (today !== lastActiveDate) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    if (lastActiveDate === yesterday) {
      updatedProfile.stats.streak = (updatedProfile.stats.streak || 0) + 1;
    } else {
      updatedProfile.stats.streak = 1;
    }
    updatedProfile.stats.longestStreak = Math.max(
      updatedProfile.stats.longestStreak || 0,
      updatedProfile.stats.streak
    );
  }

  await setStorageItem(STORAGE_KEYS.userProfile, updatedProfile);
  return updatedProfile;
}

// Achievements System
export async function checkAndAwardAchievements(userProfile: any): Promise<any> {
  const currentAchievements = userProfile.achievements || [];
  const newAchievements: any[] = [];

  const achievementChecks = [
    {
      id: 'first_problem',
      name: 'First Steps',
      description: 'Solved your first problem',
      condition: () => userProfile.stats.problemsSolved >= 1,
      icon: '🎯'
    },
    {
      id: 'streak_week',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day streak',
      condition: () => userProfile.stats.streak >= 7,
      icon: '🔥'
    },
    {
      id: 'hundred_problems',
      name: 'Centurion',
      description: 'Solved 100 problems',
      condition: () => userProfile.stats.problemsSolved >= 100,
      icon: '💯'
    },
    {
      id: 'dsa_master',
      name: 'DSA Master',
      description: 'Reached advanced level in any DSA topic',
      condition: () => Object.values(userProfile.skillScores || {}).some((score: any) => score >= 301),
      icon: '👑'
    }
  ];

  for (const achievement of achievementChecks) {
    if (!currentAchievements.some((a: any) => a.id === achievement.id) && achievement.condition()) {
      newAchievements.push({
        ...achievement,
        earnedAt: Date.now()
      });
    }
  }

  if (newAchievements.length > 0) {
    const updatedProfile = {
      ...userProfile,
      achievements: [...currentAchievements, ...newAchievements],
      experience: (userProfile.experience || 0) + (newAchievements.length * 100)
    };

    await setStorageItem(STORAGE_KEYS.userProfile, updatedProfile);
    return { profile: updatedProfile, newAchievements };
  }

  return { profile: userProfile, newAchievements: [] };
}

// Data Export for Privacy (user can export their data)
export async function exportUserData(): Promise<any> {
  const profile = await getUserProfile();
  const plan = await getCurrentStudyPlan();
  const preferences = await getStorageItem(STORAGE_KEYS.preferences);

  return {
    exportedAt: Date.now(),
    profile,
    currentPlan: plan,
    preferences,
    note: 'This is your complete zeroTrace AI study data. All data is stored locally on your device.'
  };
}

// Privacy Controls
export async function clearAllStudyData(): Promise<boolean> {
  const keys = Object.values(STORAGE_KEYS);
  return new Promise(resolve => {
    chrome.storage.local.remove(keys, () => {
      resolve(true);
    });
  });
}

export async function getStorageUsage(): Promise<{ usedBytes: number, usedMB: string }> {
  return new Promise(resolve => {
    chrome.storage.local.getBytesInUse(null, (bytes: number) => {
      resolve({
        usedBytes: bytes,
        usedMB: (bytes / (1024 * 1024)).toFixed(2)
      });
    });
  });
}
