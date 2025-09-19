export interface StudyProfile {
    id: string;
    createdAt: number;
    skillScores: SkillScores;
    sessionHistory: Session[];
    preferences: StudyPreferences;
    stats: StudyStats;
    achievements: Achievement[];
    level: number;
    experience: number;
    lastUpdated?: number;
}

export interface SkillScores {
    [key: string]: number;
}

export interface Session {
    id: string;
    timestamp: number;
    skill: string;
    problemType?: string;
    success: boolean;
    difficulty: number;
    duration?: number;
    problemsCompleted?: number;
}

export interface StudyPreferences {
    dailyTarget: number;
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    focusAreas: string[];
    reminderEnabled: boolean;
}

export interface StudyStats {
    totalStudyTime: number;
    problemsSolved: number;
    streak: number;
    longestStreak: number;
    lastActive?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: number;
    condition: () => boolean;
}

export interface StudyPlan {
    id: string;
    createdAt: number;
    targetMinutes: number;
    blocks: StudyBlock[];
    totalPlanned: number;
    estimatedCompletion: string;
}

export interface StudyBlock {
    id: string;
    skill: string;
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    type: 'focused_practice' | 'review' | 'maintenance' | 'improvement';
    resources: string[];
    startTime: number | null;
    completed: boolean;
    lastUpdated?: number;
}
