// Integration utility for connecting DSA solver with study tracking

export const initializeStudyTracking = () => {
  document.addEventListener('dsaProblemCompleted', handleProblemCompletion);
  document.addEventListener('studySessionStarted', handleSessionStart);
  document.addEventListener('studySessionEnded', handleSessionEnd);
  // eslint-disable-next-line no-console
  console.log('[Study Tracking] Initialized DSA integration');
};

const handleProblemCompletion = (event) => {
  const { problem, success, timeSpent, difficulty, category } = event.detail || {};
  document.dispatchEvent(new CustomEvent('zeroTrace:problemSolved', {
    detail: {
      problem: { title: problem?.title || 'DSA Problem', category: category || problem?.category || 'arrays' },
      success,
      timeSpent,
      difficulty: difficulty || 'medium'
    }
  }));
  // eslint-disable-next-line no-console
  console.log('[Study Tracking] Recorded problem completion:', { success, category, timeSpent });
};

const handleSessionStart = (event) => {
  const { mode, topic } = event.detail || {};
  sessionStorage.setItem('studySessionStart', JSON.stringify({ startTime: Date.now(), mode, topic }));
  // eslint-disable-next-line no-console
  console.log('[Study Tracking] Session started:', { mode, topic });
};

const handleSessionEnd = (event) => {
  const sessionData = sessionStorage.getItem('studySessionStart');
  if (sessionData) {
    const session = JSON.parse(sessionData);
    const duration = Math.floor((Date.now() - session.startTime) / (1000 * 60));
    document.dispatchEvent(new CustomEvent('zeroTrace:sessionCompleted', {
      detail: { type: session.mode, topic: session.topic, duration, ...(event.detail || {}) }
    }));
    sessionStorage.removeItem('studySessionStart');
    // eslint-disable-next-line no-console
    console.log('[Study Tracking] Session completed:', { duration, topic: session.topic });
  }
};

export const openDSASolver = () => {
  const dsaButton = document.querySelector('[data-mode="dsa"]') || document.querySelector('[aria-label="DSA Solver"]');
  if (dsaButton) {
    dsaButton.click();
    document.dispatchEvent(new CustomEvent('studySessionStarted', { detail: { mode: 'dsa', topic: 'mixed' } }));
  } else {
    // eslint-disable-next-line no-console
    console.warn('[Study Tracking] DSA solver button not found');
  }
};

export const getCurrentStats = async () => {
  try {
    const result = await new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) return resolve({});
      chrome.storage.local.get(['zt_study_stats'], resolve);
    });
    return result.zt_study_stats || { problemsSolved: 0, totalMinutes: 0, streak: 0 };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Study Tracking] Error getting stats:', error);
    return null;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStudyTracking);
} else {
  initializeStudyTracking();
}







