// Background script for zeroTrace extension
const REMINDER_ALARM_NAME = 'study_reminder';
const STREAK_CHECK_ALARM_NAME = 'streak_check';
const STORAGE_KEY = 'zt_study_profile';

chrome.runtime.onInstalled.addListener(() => {
  console.log('zeroTrace extension installed');
  
  // Ensure side panel opens when the user clicks the action icon
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.error('Error setting panel behavior:', error);
    });
  }

  // Set up study reminders and streak checking
  chrome.alarms.create(REMINDER_ALARM_NAME, {
    periodInMinutes: 1440, // Daily
    when: getNextReminderTime()
  });

  chrome.alarms.create(STREAK_CHECK_ALARM_NAME, {
    periodInMinutes: 1440, // Daily
    when: getNextMidnight()
  });
});

// Also ensure behavior is set on browser startup
chrome.runtime.onStartup?.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.error('Error setting panel behavior on startup:', error);
    });
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REMINDER_ALARM_NAME) {
    handleStudyReminder();
  } else if (alarm.name === STREAK_CHECK_ALARM_NAME) {
    handleStreakCheck();
  }
});

// Get next 10 AM time
function getNextReminderTime() {
  const now = new Date();
  const reminderTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    10, // 10 AM
    0,
    0
  );
  
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  return reminderTime.getTime();
}

// Get next midnight
function getNextMidnight() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// Handle daily study reminder
async function handleStudyReminder() {
  const profile = await loadStudyProfile();
  
  if (profile && !hasStudiedToday(profile)) {
    chrome.notifications.create('study_reminder', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Time to Study!',
      message: `Maintain your ${profile.stats.streak} day streak! Click to start today's study session.`,
      priority: 2
    });
  }
}

// Handle streak check at midnight
async function handleStreakCheck() {
  const profile = await loadStudyProfile();
  
  if (profile) {
    const hasStudied = hasStudiedToday(profile);
    let { streak, longestStreak } = profile.stats;
    
    if (hasStudied) {
      streak++;
      longestStreak = Math.max(streak, longestStreak);
    } else {
      streak = 0;
    }
    
    // Update streak stats
    await updateStudyProfile({
      ...profile,
      stats: {
        ...profile.stats,
        streak,
        longestStreak
      }
    });
  }
}

// Load study profile from storage
function loadStudyProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY]);
    });
  });
}

// Save study profile to storage
function updateStudyProfile(profile) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [STORAGE_KEY]: profile },
      () => resolve()
    );
  });
}

// Check if user has studied today
function hasStudiedToday(profile) {
  if (!profile.sessionHistory.length) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSession = new Date(
    profile.sessionHistory[profile.sessionHistory.length - 1].timestamp
  );
  
  return lastSession >= today;
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'study_reminder') {
    // Open sidebar with study plan
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.setOptions({
          enabled: true,
          path: 'index.html?mode=study'
        });
      }
    });
  }
});

// Handle API requests to bypass CORS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CAPTURE_SCREEN') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }
  if (request.type === 'API_REQUEST') {
    fetch(request.url, request.options)
      .then(response => {
        if (request.stream) {
          // Handle streaming response
          const reader = response.body.getReader();
          const stream = new ReadableStream({
            start(controller) {
              function pump() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  return pump();
                });
              }
              return pump();
            }
          });
          
          return new Response(stream).text();
        } else {
          return response.json();
        }
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep message channel open for async response
  }
});