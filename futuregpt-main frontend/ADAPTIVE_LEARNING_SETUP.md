# Adaptive Learning System Setup Guide

## 🚀 Quick Start

The adaptive learning system is now configured with your API credentials:
- **Base URL**: `https://api.a4f.co/v`
- **API Key**: `ddc-a4f-caee73746e914d3bb457fe535b7dd9a8`
- **Model**: `gpt-4o`

## 📋 System Architecture

### Core Components
1. **Configuration Management** (`src/adaptive_learning/config.ts`)
   - Centralized settings for API, domains, and system parameters
   - Pre-configured with your API credentials

2. **Storage Manager** (`src/adaptive_learning/storage.ts`)
   - Privacy-first local storage using `chrome.storage.local`
   - Handles user data, progress, and API configuration persistence

3. **User Modeling** (`src/adaptive_learning/userModeling.ts`)
   - TensorFlow.js-based learning analytics
   - Tracks knowledge state, learning patterns, and engagement

4. **Content Generation** (`src/adaptive_learning/contentGeneration.ts`)
   - AI-powered question and content generation
   - Uses your configured API for dynamic content creation

5. **Learning Interface** (`src/adaptive_learning/learningInterface.ts`)
   - Main orchestrator for the adaptive learning flow
   - Manages sessions, progress, and user interactions

## 🔧 API Configuration

### Current Setup
Your system is pre-configured with:
```typescript
{
  baseUrl: 'https://api.a4f.co/v',
  apiKey: 'ddc-a4f-caee73746e914d3bb457fe535b7dd9a8',
  modelName: 'gpt-4o',
  maxTokens: 2000,
  temperature: 0.7,
  timeout: 30000
}
```

### Testing API Connection
1. Open the browser console in your extension
2. Run the test script:
```javascript
// Load and run the test
fetch('./test-api-config.js')
  .then(response => response.text())
  .then(script => eval(script));
```

### Updating API Configuration
Use the `AdaptiveLearningConfig` component or programmatically:
```typescript
import { config } from './src/adaptive_learning/config';
import { storageManager } from './src/adaptive_learning/storage';

// Update configuration
config.updateAPIConfig('https://api.a4f.co/v', 'your-api-key', 'gpt-4o');

// Save to storage
await storageManager.saveAPIConfig({
  baseUrl: 'https://api.a4f.co/v',
  apiKey: 'your-api-key',
  modelName: 'gpt-4o'
});
```

## 🎯 Learning Domains

The system supports four main learning domains:

### 1. Data Structures & Algorithms (DSA)
- **Topics**: Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, etc.
- **Assessment Types**: MCQ, Subjective, Practical, Case Study
- **Difficulty Levels**: Beginner to Expert

### 2. UPSC Civil Services
- **Topics**: Indian Polity, Geography, History, Economics, Current Affairs, etc.
- **Assessment Types**: MCQ, Subjective, Essay Writing
- **Difficulty Levels**: Beginner to Expert

### 3. JEE (Joint Entrance Examination)
- **Topics**: Physics, Chemistry, Mathematics
- **Assessment Types**: MCQ, Subjective, Problem Solving
- **Difficulty Levels**: Beginner to Expert

### 4. Software Development
- **Topics**: Frontend, Backend, Mobile, DevOps, Cloud Computing, etc.
- **Assessment Types**: MCQ, Subjective, Practical, Case Study
- **Difficulty Levels**: Beginner to Expert

## 🧠 User Modeling Features

### Knowledge State Tracking
- Real-time assessment of user proficiency in each topic
- Adaptive difficulty adjustment based on performance
- Spaced repetition for optimal retention

### Learning Analytics
- Response time analysis
- Confidence level tracking
- Engagement metrics
- Progress visualization

### Reinforcement Learning
- PPO algorithm for adaptive pathways
- Dynamic content recommendation
- Personalized study plans

## 🎮 Gamification System

### Achievement System
- **First Steps**: Complete first question
- **Streak Warrior**: Maintain 7-day study streak
- **Dedicated Learner**: Study for 30 consecutive days
- **Topic Master**: Master a specific topic
- **Domain Expert**: Achieve expertise in a domain

### Progress Tracking
- Points system (10 points per correct answer)
- Streak multipliers (1.5x bonus for streaks)
- Daily goals and bonuses
- Level progression system

## 🔒 Privacy & Security

### Data Storage
- All data stored locally using `chrome.storage.local`
- No external data transmission except API calls
- User data never leaves the browser

### API Security
- API keys stored securely in Chrome storage
- Rate limiting implemented for API calls
- Error handling with fallback mechanisms

### GDPR Compliance
- Data export functionality
- Complete data deletion options
- User consent management

## 🚀 Usage Examples

### Basic Usage
```typescript
import { useAdaptiveLearning } from './src/hooks/useAdaptiveLearning';

function LearningComponent() {
  const {
    isInitialized,
    isLoading,
    error,
    selectDomain,
    startSession,
    submitAnswer,
    endSession
  } = useAdaptiveLearning();

  const handleDomainSelection = async (domainId: string) => {
    await selectDomain(domainId);
    await startSession();
  };

  const handleAnswerSubmission = async (questionId: string, answer: string) => {
    const startTime = Date.now();
    await submitAnswer(questionId, answer, Date.now() - startTime);
  };
}
```

### Domain Selection Interface
```typescript
import { DomainSelector } from './src/components/DomainSelector';
import { useAdaptiveLearning } from './src/hooks/useAdaptiveLearning';

function App() {
  const { learningInterface } = useAdaptiveLearning();

  return (
    <div>
      <h1>What do you want to learn?</h1>
      <DomainSelector learningInterface={learningInterface} />
    </div>
  );
}
```

## 🧪 Testing Checklist

### Pre-deployment Tests
- [ ] API connection test passes
- [ ] Storage initialization works
- [ ] Domain selection functional
- [ ] Question generation working
- [ ] Answer submission and feedback
- [ ] Progress tracking accurate
- [ ] Gamification triggers correctly

### Performance Tests
- [ ] TensorFlow.js models load properly
- [ ] API response times acceptable
- [ ] Storage operations efficient
- [ ] UI responsiveness maintained

### Security Tests
- [ ] API keys not exposed in console
- [ ] Data encryption in storage
- [ ] CORS policies respected
- [ ] Rate limiting functional

## 🔧 Troubleshooting

### Common Issues

#### API Connection Failures
```javascript
// Check API configuration
console.log('Current API Config:', config.apiConfig);

// Test connection manually
fetch('https://api.a4f.co/v/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ddc-a4f-caee73746e914d3bb457fe535b7dd9a8'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }],
    model: 'gpt-4o'
  })
});
```

#### Storage Issues
```javascript
// Check storage status
chrome.storage.local.get(null, (data) => {
  console.log('Storage contents:', data);
});

// Clear storage if needed
chrome.storage.local.clear();
```

#### TensorFlow.js Issues
```javascript
// Check TensorFlow.js availability
if (typeof tf !== 'undefined') {
  console.log('TensorFlow.js loaded successfully');
} else {
  console.error('TensorFlow.js not available');
}
```

### Performance Optimization

#### Memory Management
- Clear expired cache regularly
- Limit interaction history size
- Optimize TensorFlow.js model updates

#### API Optimization
- Implement request caching
- Use batch operations where possible
- Monitor rate limits

## 📈 Extensibility

### Adding New Domains
1. Update `config.ts` with new domain configuration
2. Add domain-specific content templates
3. Update UI components for domain selection
4. Test with sample questions

### Custom AI Providers
1. Implement provider-specific API adapter
2. Update configuration interface
3. Add provider selection UI
4. Test with provider credentials

### Advanced Analytics
1. Extend user modeling with additional metrics
2. Implement advanced visualization components
3. Add export/import functionality
4. Create custom reporting dashboards

## 🎯 Next Steps

1. **Test the system** with the provided API credentials
2. **Customize domains** based on your specific needs
3. **Integrate with existing UI** components
4. **Add advanced features** like collaborative learning
5. **Implement analytics dashboard** for insights
6. **Add mobile responsiveness** for better UX

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Test API connection independently
4. Verify storage permissions in manifest.json

---

**Note**: This system is designed to be privacy-first and runs entirely within the Chrome extension environment. All user data remains local unless explicitly exported by the user.
