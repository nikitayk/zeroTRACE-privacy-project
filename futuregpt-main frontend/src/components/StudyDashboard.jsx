import React, { useState, useEffect } from 'react';
import useStudyData from '../hooks/useStudyData';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import './StudyDashboard.css';

const StudyDashboard = () => {
  const {
    studyData,
    isLoading,
    hasRealData,
    recordSession,
    checkAchievements,
    getStudyPlan,
    getRecentActivity
  } = useStudyData();

  const { learningInterface, isInitialized, isLoading: adaptiveLoading } = useAdaptiveLearning();

  const [studyPlans, setStudyPlans] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [adaptiveData, setAdaptiveData] = useState(null);

  useEffect(() => {
    const loadAdaptiveData = async () => {
      if (learningInterface && isInitialized) {
        try {
          const domains = await learningInterface.getAvailableDomains();
          const userModel = await learningInterface.getUserModel();
          setAdaptiveData({ domains, userModel });
        } catch (error) {
          console.error('Failed to load adaptive learning data:', error);
        }
      }
    };

    loadAdaptiveData();
  }, [learningInterface, isInitialized]);

  useEffect(() => {
    if (!isLoading) {
      setStudyPlans(getStudyPlan());
      setRecentActivity(getRecentActivity());
    }
  }, [studyData, isLoading, getStudyPlan, getRecentActivity]);

  const CircularProgress = ({ percentage, size = 100 }) => {
    const radius = (size - 12) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg className="progress-ring" width={size} height={size}>
          <circle
            className="progress-ring-background"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="6"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="progress-ring-fill"
            stroke="#8b5cf6"
            strokeWidth="6"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="progress-center">
          <span className="progress-percentage">{percentage}%</span>
          <span className="progress-label">Goal</span>
        </div>
      </div>
    );
  };

  const dailyProgress = Math.min(100, (studyData.daily.todayMinutes / studyData.daily.dailyGoal) * 100) || 0;

  if (isLoading || adaptiveLoading) {
    return (
      <div className="study-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your adaptive learning progress...</p>
      </div>
    );
  }

  return (
    <div className="study-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Adaptive Learning! 🧠</h1>
          <p className="welcome-subtitle">Your personalized learning journey powered by AI</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-number">{studyData.stats.streak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧮</div>
            <div className="stat-content">
              <span className="stat-number">{studyData.stats.problemsSolved}</span>
              <span className="stat-label">Problems</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <span className="stat-number">{studyData.stats.studyTime}</span>
              <span className="stat-label">Study Time</span>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>📈 Today's Progress</h2>
        <div className="progress-content">
          <CircularProgress percentage={Math.round(dailyProgress)} />
          <div className="progress-stats">
            <div className="progress-item">
              <span className="progress-label">Study Time</span>
              <span className="progress-value">{studyData.daily.todayMinutes}/{studyData.daily.dailyGoal} min</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">Problems Solved</span>
              <span className="progress-value">{studyData.daily.todayProblems}/{studyData.daily.problemGoal}</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">Status</span>
              <span className="progress-value status">{dailyProgress >= 100 ? '🎯 Goal Complete!' : dailyProgress >= 50 ? '📈 On Track' : '⚡ Getting Started'}</span>
            </div>
          </div>
        </div>
      </div>

      {adaptiveData && adaptiveData.domains && (
        <div className="topics-section">
          <h2>🎯 Learning Domains</h2>
          <div className="topics-grid">
            {adaptiveData.domains.map(domain => (
              <div key={domain.id} className="topic-card">
                <div className="topic-header">
                  <span className="topic-title">{domain.name}</span>
                  <span className="difficulty-badge">{Math.round(domain.userProgress.overallProgress * 100)}%</span>
                </div>
                <div className="topic-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${domain.userProgress.overallProgress * 100}%` }}></div>
                  </div>
                  <span className="progress-text">{domain.userProgress.topicsMastered}/{domain.userProgress.totalTopics} topics</span>
                </div>
                <div className="topic-stats">
                  <span className="stat">Accuracy: {Math.round(domain.userProgress.averageAccuracy * 100)}%</span>
                  <span className="stat">Streak: {domain.userProgress.studyStreak} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions-section">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button primary" onClick={() => {
            document.dispatchEvent(new CustomEvent('zeroTrace:switchMode', { detail: { mode: 'adaptive-learning' } }));
          }}>
            <span className="action-icon">🧠</span>
            <div className="action-content">
              <span className="action-title">Adaptive Learning</span>
              <span className="action-subtitle">Choose your learning domain</span>
            </div>
          </button>
          <button className="action-button" onClick={() => {
            document.dispatchEvent(new CustomEvent('zeroTrace:switchMode', { detail: { mode: 'dsa-solver' } }));
          }}>
            <span className="action-icon">🧮</span>
            <div className="action-content">
              <span className="action-title">Solve Problems</span>
              <span className="action-subtitle">Practice DSA algorithms</span>
            </div>
          </button>
          <button className="action-button" onClick={() => {
            document.dispatchEvent(new CustomEvent('zeroTrace:switchMode', { detail: { mode: 'chat' } }));
          }}>
            <span className="action-icon">💬</span>
            <div className="action-content">
              <span className="action-title">Ask AI</span>
              <span className="action-subtitle">Get help with concepts</span>
            </div>
          </button>
          <button className="action-button" onClick={() => {
            document.dispatchEvent(new CustomEvent('zeroTrace:switchMode', { detail: { mode: 'gamification' } }));
          }}>
            <span className="action-icon">🏆</span>
            <div className="action-content">
              <span className="action-title">Achievements</span>
              <span className="action-subtitle">View your progress</span>
            </div>
          </button>
        </div>
      </div>

      {recentActivity.length > 0 && (
        <div className="activity-section">
          <h2>📝 Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-content">
                  <span className="activity-title">{activity.title}</span>
                  <span className="activity-time">{activity.time}</span>
                  <span className="activity-details">{activity.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDashboard;







