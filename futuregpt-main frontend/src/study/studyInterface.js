// zeroTrace AI Study Interface - Integrated with existing sidebar

import { generateStudyPlan, updateUserProgress, getNextRecommendation, STUDY_CONFIG } from './adaptiveEngine.js';
import { getUserProfile, updateUserProfile, getCurrentStudyPlan, saveStudyPlan, recordStudySession, checkAndAwardAchievements } from './studyStorage.js';

class StudyInterface {
  constructor() {
    this.currentPlan = null;
    this.userProfile = null;
    this.activeBlock = null;
    this.sessionStartTime = null;
    this.init();
  }
  
  async init() {
    await this.loadUserData();
    this.setupEventListeners();
    this.renderInterface();
    this.startDailyCheck();
  }
  
  async loadUserData() {
    this.userProfile = await getUserProfile();
    this.currentPlan = await getCurrentStudyPlan();
    
    // Generate new plan if none exists or current plan is completed
    if (!this.currentPlan || this.isPlanCompleted(this.currentPlan)) {
      await this.generateNewPlan();
    }
  }
  
  isPlanCompleted(plan) {
    return plan.blocks?.every(block => block.completed);
  }
  
  async generateNewPlan() {
    try {
      this.currentPlan = generateStudyPlan(this.userProfile, this.userProfile.preferences);
      await saveStudyPlan(this.currentPlan);
      this.renderInterface();
      this.showNotification('New study plan generated! \ud83d\udcda', 'success');
    } catch (error) {
      console.error('Error generating study plan:', error);
      this.showNotification('Failed to generate study plan', 'error');
    }
  }
  
  renderInterface() {
    const container = this.getOrCreateContainer();
    container.innerHTML = this.buildHTML();
    this.bindEventHandlers();
  }
  
  getOrCreateContainer() {
    let container = document.getElementById('study-interface');
    if (!container) {
      container = document.createElement('div');
      container.id = 'study-interface';
      container.className = 'zt-study-container';
      
      // Prefer an explicit host inside the React tree if available
      const host = document.getElementById('zt-study-host');
      if (host) {
        host.appendChild(container);
      } else {
        // Fallback: Insert into zeroTrace sidebar or body
        const sidebar = document.querySelector('.sidebar-content') || document.body;
        sidebar.appendChild(container);
      }
    }
    return container;
  }
  
  buildHTML() {
    const recommendation = getNextRecommendation(this.userProfile);
    const progress = this.calculateProgress();
    
    return `
      <div class="study-header">
        <h2>\ud83c\udfaf Study Plan</h2>
        <div class="level-badge">
          Level ${this.userProfile.level || 1} \u2022 ${this.userProfile.experience || 0} XP
        </div>
      </div>
      
      ${this.renderProgressSection(progress)}
      ${this.renderRecommendationSection(recommendation)}
      ${this.renderCurrentPlan()}
      ${this.renderQuickActions()}
      ${this.renderAchievements()}
    `;
  }
  
  renderProgressSection(progress) {
    return `
      <div class="progress-section">
        <div class="streak-display">
          <span class="streak-icon">\ud83d\udd25</span>
          <span class="streak-count">${this.userProfile.stats?.streak || 0} day streak</span>
        </div>
        <div class="daily-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.dailyPercent}%"></div>
          </div>
          <span class="progress-text">${progress.completedToday}/${progress.targetToday} min today</span>
        </div>
      </div>
    `;
  }
  
  renderRecommendationSection(recommendation) {
    const iconMap = {
      'improvement': '\ud83d\udcc8',
      'maintenance': '\ud83c\udf1f',
      'challenge': '\ud83d\udcaa'
    };
    
    return `
      <div class="recommendation-card">
        <div class="rec-icon">${iconMap[recommendation.type] || '\ud83d\udca1'}</div>
        <div class="rec-content">
          <div class="rec-message">${recommendation.message}</div>
          <div class="rec-action">
            <button class="start-recommended" data-skill="${recommendation.suggestedSkill}" data-difficulty="${recommendation.difficulty}">
              Start ${recommendation.suggestedSkill} (${recommendation.difficulty})
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  renderCurrentPlan() {
    if (!this.currentPlan || !this.currentPlan.blocks?.length) {
      return `
        <div class="no-plan">
          <p>No active study plan</p>
          <button class="generate-plan-btn">Generate New Plan</button>
        </div>
      `;
    }
    
    const blocksHTML = this.currentPlan.blocks.map(block => this.renderStudyBlock(block)).join('');
    
    return `
      <div class="study-plan-section">
        <h3>Today's Plan</h3>
        <div class="study-blocks">
          ${blocksHTML}
        </div>
      </div>
    `;
  }
  
  renderStudyBlock(block) {
    const statusClass = block.completed ? 'completed' : block.started ? 'in-progress' : 'pending';
    const statusIcon = block.completed ? '\u2705' : block.started ? '\ud83d\udd04' : '\u23ef\ufe0f';
    
    return `
      <div class="study-block ${statusClass}" data-block-id="${block.id}">
        <div class="block-header">
          <span class="block-status">${statusIcon}</span>
          <span class="block-skill">${block.skill}</span>
          <span class="block-duration">${block.duration}min</span>
        </div>
        <div class="block-details">
          <div class="difficulty-badge difficulty-${block.difficulty}">${block.difficulty}</div>
          <div class="block-type">${block.type}</div>
        </div>
        <div class="block-resources">
          ${block.resources.map(r => `<span class=\"resource-tag\">${r}</span>`).join('')}
        </div>
        <div class="block-actions">
          ${!block.completed ? `
            <button class="start-block-btn" data-block-id="${block.id}">
              ${block.started ? 'Continue' : 'Start'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  renderQuickActions() {
    return `
      <div class="quick-actions">
        <button class="action-btn" id="practice-dsa">
          \ud83e\uddee Quick DSA Practice
        </button>
        <button class="action-btn" id="review-concepts">
          \ud83d\udcd6 Review Concepts
        </button>
        <button class="action-btn" id="view-progress">
          \ud83d\udcca View Progress
        </button>
      </div>
    `;
  }
  
  renderAchievements() {
    const recentAchievements = (this.userProfile.achievements || [])
      .sort((a, b) => b.earnedAt - a.earnedAt)
      .slice(0, 3);
    
    if (!recentAchievements.length) return '';
    
    return `
      <div class="achievements-section">
        <h4>Recent Achievements</h4>
        <div class="achievement-list">
          ${recentAchievements.map(achievement => `
            <div class="achievement-item">
              <span class="achievement-icon">${achievement.icon}</span>
              <div class="achievement-details">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  bindEventHandlers() {
    // Start recommended practice
    document.querySelectorAll('.start-recommended').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const skill = target.getAttribute('data-skill');
        const difficulty = target.getAttribute('data-difficulty');
        this.startPracticeSession?.(skill, difficulty);
      });
    });
    
    // Start study blocks
    document.querySelectorAll('.start-block-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const blockId = target.getAttribute('data-block-id');
        this.startStudyBlock(blockId);
      });
    });
    
    // Generate new plan
    document.querySelectorAll('.generate-plan-btn').forEach(btn => {
      btn.addEventListener('click', () => this.generateNewPlan());
    });
    
    // Quick actions
    document.getElementById('practice-dsa')?.addEventListener('click', () => {
      this.triggerDSAPractice();
    });
    
    document.getElementById('review-concepts')?.addEventListener('click', () => {
      this.openConceptReview?.();
    });
    
    document.getElementById('view-progress')?.addEventListener('click', () => {
      this.showProgressModal?.();
    });
  }
  
  async startStudyBlock(blockId) {
    const block = this.currentPlan.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    this.activeBlock = block;
    this.sessionStartTime = Date.now();
    
    // Update block status
    block.started = true;
    block.startTime = this.sessionStartTime;
    await saveStudyPlan(this.currentPlan);
    
    // Integrate with existing zeroTrace AI modes
    this.integrateWithZeroTrace(block);
    
    this.showNotification(`Started ${block.skill} practice session`, 'info');
    this.renderInterface();
  }
  
  integrateWithZeroTrace(block) {
    // Send study context to zeroTrace AI system
    const studyContext = {
      mode: 'study',
      skill: block.skill,
      difficulty: block.difficulty,
      resources: block.resources,
      duration: block.duration
    };
    
    // Trigger zeroTrace AI with study context
    if (window.zeroTraceAI) {
      window.zeroTraceAI.setStudyMode(studyContext);
    }
    
    // Switch to appropriate mode (Code for DSA, Research for concepts, etc.)
    const modeMap = {
      'arrays': 'code',
      'linkedlists': 'code', 
      'trees': 'code',
      'graphs': 'code',
      'dp': 'code',
      'system-design': 'research'
    };
    
    const targetMode = modeMap[block.skill] || 'chat';
    this.switchToMode(targetMode);
  }
  
  switchToMode(mode) {
    // Integrate with existing zeroTrace sidebar mode switching
    const modeButton = document.querySelector(`[data-mode="${mode}"]`);
    if (modeButton) {
      modeButton.click();
    }
  }
  
  async completeCurrentSession(sessionData = {}) {
    if (!this.activeBlock || !this.sessionStartTime) return;
    
    const duration = Math.floor((Date.now() - this.sessionStartTime) / (1000 * 60));
    const session = {
      blockId: this.activeBlock.id,
      skill: this.activeBlock.skill,
      difficulty: this.activeBlock.difficulty,
      duration,
      ...sessionData
    };
    
    // Record session and update progress
    await recordStudySession(session);
    this.userProfile = await getUserProfile();
    
    // Mark block as completed
    this.activeBlock.completed = true;
    this.activeBlock.completedAt = Date.now();
    await saveStudyPlan(this.currentPlan);
    
    // Check for achievements
    const { profile, newAchievements } = await checkAndAwardAchievements(this.userProfile);
    this.userProfile = profile;
    
    if (newAchievements.length > 0) {
      this.showAchievementNotification(newAchievements);
    }
    
    this.activeBlock = null;
    this.sessionStartTime = null;
    this.renderInterface();
  }
  
  calculateProgress() {
    const today = new Date().toDateString();
    const todaySessions = (this.userProfile.sessionHistory || [])
      .filter(session => new Date(session.timestamp).toDateString() === today);
    
    const completedToday = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const targetToday = this.userProfile.preferences?.dailyTarget || STUDY_CONFIG.dailyTargetMinutes;
    const dailyPercent = Math.min(100, (completedToday / targetToday) * 100);
    
    return {
      completedToday,
      targetToday,
      dailyPercent
    };
  }
  
  setupEventListeners() {
    // Listen for DSA problem completions from main zeroTrace system
    document.addEventListener('zeroTrace:problemSolved', (event) => {
      const { problem, success, difficulty } = event.detail || {};
      if (this.activeBlock) {
        this.completeCurrentSession({
          problemsCompleted: 1,
          success,
          difficulty
        });
      }
    });
    
    // Listen for mode changes
    document.addEventListener('zeroTrace:modeChanged', (event) => {
      if ((event.detail || {}).mode === 'study') {
        this.renderInterface();
      }
    });
  }
  
  triggerDSAPractice() {
    // Integrate with existing DSA solver
    const dsaSolverBtn = document.querySelector('[data-mode="dsa"]');
    if (dsaSolverBtn) {
      dsaSolverBtn.click();
    }
  }
  
  showNotification(message, type = 'info') {
    // Use existing zeroTrace notification system or create simple one
    if (window.zeroTraceNotifications) {
      window.zeroTraceNotifications.show(message, type);
    } else {
      console.log(`[ZeroTrace Study] ${message}`);
    }
  }
  
  showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
      this.showNotification(
        `\ud83c\udf89 Achievement Unlocked: ${achievement.name} - ${achievement.description}`,
        'success'
      );
    });
  }
  
  startDailyCheck() {
    // Check daily progress and send reminders
    setInterval(() => {
      this.checkDailyProgress();
    }, 60 * 60 * 1000); // Check every hour
  }
  
  async checkDailyProgress() {
    const progress = this.calculateProgress();
    const currentHour = new Date().getHours();
    
    // Send reminder if behind on daily goal (between 10 AM and 8 PM)
    if (currentHour >= 10 && currentHour <= 20 && progress.dailyPercent < 50) {
      this.showNotification(
        `\ud83d\udcda You're ${Math.round(50 - progress.dailyPercent)}% behind on today's study goal!`,
        'reminder'
      );
    }
  }
}

export { StudyInterface };


