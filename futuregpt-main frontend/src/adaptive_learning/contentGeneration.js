// AI-Powered Content Generation for Adaptive Learning
import { config } from './config.js';

class Question {
  constructor(id, domain, topic, difficulty, questionType, questionText, options = [], correctAnswer = '', explanation = '', hints = [], estimatedTime = 5.0, tags = []) {
    this.id = id;
    this.domain = domain;
    this.topic = topic;
    this.difficulty = difficulty;
    this.questionType = questionType; // 'mcq', 'subjective', 'practical', 'case_study'
    this.questionText = questionText;
    this.options = options; // For MCQ
    this.correctAnswer = correctAnswer;
    this.explanation = explanation;
    this.hints = hints;
    this.estimatedTime = estimatedTime; // minutes
    this.tags = tags;
    this.createdAt = Date.now();
  }
}

class LearningContent {
  constructor(id, domain, topic, contentType, title, content, difficulty, estimatedReadTime, prerequisites = [], learningObjectives = []) {
    this.id = id;
    this.domain = domain;
    this.topic = topic;
    this.contentType = contentType; // 'explanation', 'example', 'tutorial', 'summary'
    this.title = title;
    this.content = content;
    this.difficulty = difficulty;
    this.estimatedReadTime = estimatedReadTime; // minutes
    this.prerequisites = prerequisites;
    this.learningObjectives = learningObjectives;
    this.createdAt = Date.now();
  }
}

class AIContentGenerator {
  constructor() {
    this.apiConfig = config.apiConfig;
    this.questionTemplates = this.loadQuestionTemplates();
    this.contentTemplates = this.loadContentTemplates();
    this.rateLimiter = {
      lastCall: 0,
      minInterval: 1000 // 1 second between calls
    };
  }

  loadQuestionTemplates() {
    return {
      dsa_programming: {
        mcq: 'Create a multiple-choice question about {topic} at {difficulty} level. Include 4 options with one correct answer and explanation.',
        practical: 'Create a coding problem about {topic} at {difficulty} level. Include problem statement, input/output format, constraints, and sample test cases.',
        subjective: 'Create a theoretical question about {topic} at {difficulty} level that requires explanation of concepts.'
      },
      upsc_preparation: {
        mcq: 'Create a UPSC-style multiple-choice question on {topic} at {difficulty} level. Include 4 options and detailed explanation.',
        subjective: 'Create a UPSC mains-style question on {topic} at {difficulty} level for essay writing or descriptive answer.',
        case_study: 'Create a case study question on {topic} at {difficulty} level with scenario analysis.'
      },
      jee_preparation: {
        mcq: 'Create a JEE-style multiple-choice question on {topic} at {difficulty} level with 4 options and step-by-step solution.',
        subjective: 'Create a JEE subjective question on {topic} at {difficulty} level that requires mathematical derivation or proof.',
        practical: 'Create a JEE numerical problem on {topic} at {difficulty} level with given data and required calculations.'
      },
      developer_skills: {
        mcq: 'Create a technical interview question about {topic} at {difficulty} level with multiple-choice options.',
        practical: 'Create a hands-on coding/implementation task for {topic} at {difficulty} level.',
        case_study: 'Create a system design or architecture question about {topic} at {difficulty} level.'
      }
    };
  }

  loadContentTemplates() {
    return {
      explanation: 'Provide a clear and comprehensive explanation of {topic} at {difficulty} level. Include key concepts, examples, and practical applications.',
      tutorial: 'Create a step-by-step tutorial on {topic} at {difficulty} level. Include practical examples and hands-on exercises.',
      summary: 'Create a concise summary of {topic} at {difficulty} level covering the most important points.',
      example: 'Provide detailed examples and use cases for {topic} at {difficulty} level with explanations.'
    };
  }

  async generateQuestion(domain, topic, difficulty, questionType, userContext = null) {
    try {
      // Rate limiting
      await this.waitForRateLimit();

      // Get appropriate template
      const domainTemplates = this.questionTemplates[domain] || {};
      const template = domainTemplates[questionType] || 
        `Create a ${questionType} question about {topic} at {difficulty} level.`;
      
      // Build prompt with context
      const prompt = this.buildQuestionPrompt(template, domain, topic, difficulty, questionType, userContext);
      
      // Generate content using AI
      const response = await this.callAIAPI(prompt);
      
      // Parse response into Question object
      const question = this.parseQuestionResponse(response, domain, topic, difficulty, questionType);
      
      return question;
      
    } catch (error) {
      console.error('Error generating question:', error);
      // Return fallback question
      return this.createFallbackQuestion(domain, topic, difficulty, questionType);
    }
  }

  buildQuestionPrompt(template, domain, topic, difficulty, questionType, userContext) {
    let prompt = template.replace('{topic}', topic)
                        .replace('{difficulty}', difficulty)
                        .replace('{question_type}', questionType);
    
    // Add domain-specific context
    const domainContext = this.getDomainContext(domain);
    prompt += `\n\nDomain Context: ${domainContext}`;
    
    // Add user context if available
    if (userContext) {
      const knowledgeLevel = userContext.knowledgeLevel || 0.5;
      const learningStyle = userContext.preferredLearningStyle || 'mixed';
      const recentTopics = userContext.recentTopics || [];
      
      prompt += `\n\nUser Context:`;
      prompt += `\n- Knowledge Level: ${knowledgeLevel.toFixed(2)} (0.0-1.0)`;
      prompt += `\n- Learning Style: ${learningStyle}`;
      prompt += `\n- Recent Topics: ${recentTopics.slice(-5).join(', ')}`;
    }
    
    // Add output format specification
    prompt += this.getOutputFormatSpec(questionType);
    
    return prompt;
  }

  getDomainContext(domain) {
    const contexts = {
      dsa_programming: 'Focus on algorithms, data structures, time/space complexity, and coding best practices. Questions should be relevant for technical interviews and competitive programming.',
      upsc_preparation: 'Focus on Indian administration, governance, current affairs, and analytical thinking. Questions should match UPSC exam patterns and difficulty levels.',
      jee_preparation: 'Focus on Physics, Chemistry, and Mathematics concepts. Questions should match JEE exam patterns with appropriate difficulty and numerical problems.',
      developer_skills: 'Focus on modern software development practices, technologies, and real-world application scenarios. Questions should be relevant for software development roles.'
    };
    return contexts[domain] || 'Generate educationally sound questions appropriate for the learning context.';
  }

  getOutputFormatSpec(questionType) {
    if (questionType === 'mcq') {
      return `
      
Output Format (JSON):
{
  "question": "Question text here",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correct_answer": "A",
  "explanation": "Detailed explanation of the correct answer",
  "hints": ["Hint 1", "Hint 2"],
  "estimated_time": 3.0
}
`;
    } else if (questionType === 'practical') {
      return `
      
Output Format (JSON):
{
  "question": "Problem statement",
  "input_format": "Description of input format",
  "output_format": "Description of expected output",
  "constraints": "Problem constraints",
  "sample_input": "Sample input",
  "sample_output": "Sample output",
  "explanation": "Approach and solution explanation",
  "hints": ["Hint 1", "Hint 2"],
  "estimated_time": 15.0
}
`;
    } else {
      return `
      
Output Format (JSON):
{
  "question": "Question text",
  "answer_guidelines": "Guidelines for answering",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "explanation": "Sample answer or explanation",
  "estimated_time": 8.0
}
`;
    }
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.rateLimiter.lastCall;
    
    if (timeSinceLastCall < this.rateLimiter.minInterval) {
      const waitTime = this.rateLimiter.minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.rateLimiter.lastCall = Date.now();
  }

  async callAIAPI(prompt) {
    if (!this.apiConfig.isValid()) {
      throw new Error('AI API not configured. Please provide base_url and api_key.');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiConfig.apiKey}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      model: this.apiConfig.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Generate high-quality, pedagogically sound learning materials.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.apiConfig.maxTokens,
      temperature: this.apiConfig.temperature
    };

    try {
      const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.apiConfig.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  parseQuestionResponse(response, domain, topic, difficulty, questionType) {
    try {
      // Try to extract JSON from response
      let jsonStart = response.indexOf('{');
      let jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === -1) {
        // Fallback: try to parse the entire response as JSON
        const data = JSON.parse(response);
        return this.createQuestionFromData(data, domain, topic, difficulty, questionType);
      }
      
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonStr);
      
      return this.createQuestionFromData(data, domain, topic, difficulty, questionType);
      
    } catch (error) {
      console.error('Error parsing question response:', error);
      // Return fallback question with raw response
      return this.createFallbackQuestion(domain, topic, difficulty, questionType, response);
    }
  }

  createQuestionFromData(data, domain, topic, difficulty, questionType) {
    const questionId = `${domain}_${topic}_${difficulty}_${Date.now()}`;
    
    // Handle different response formats
    if (questionType === 'mcq') {
      return new Question(
        questionId,
        domain,
        topic,
        difficulty,
        questionType,
        data.question || '',
        data.options || [],
        data.correct_answer || '',
        data.explanation || '',
        data.hints || [],
        data.estimated_time || 5.0
      );
    } else if (questionType === 'practical') {
      // Combine practical question parts
      let questionText = data.question || '';
      if (data.input_format) {
        questionText += `\n\nInput Format: ${data.input_format}`;
      }
      if (data.output_format) {
        questionText += `\nOutput Format: ${data.output_format}`;
      }
      if (data.constraints) {
        questionText += `\nConstraints: ${data.constraints}`;
      }
      if (data.sample_input && data.sample_output) {
        questionText += `\n\nSample Input:\n${data.sample_input}`;
        questionText += `\nSample Output:\n${data.sample_output}`;
      }
      
      return new Question(
        questionId,
        domain,
        topic,
        difficulty,
        questionType,
        questionText,
        [],
        '',
        data.explanation || '',
        data.hints || [],
        data.estimated_time || 15.0
      );
    } else {
      // Subjective/case study
      let questionText = data.question || '';
      if (data.answer_guidelines) {
        questionText += `\n\nAnswer Guidelines: ${data.answer_guidelines}`;
      }
      
      return new Question(
        questionId,
        domain,
        topic,
        difficulty,
        questionType,
        questionText,
        [],
        data.explanation || '',
        data.explanation || '',
        data.key_points || [],
        data.estimated_time || 8.0
      );
    }
  }

  createFallbackQuestion(domain, topic, difficulty, questionType, rawResponse = null) {
    const questionId = `fallback_${domain}_${topic}_${Date.now()}`;
    
    const fallbackQuestions = {
      dsa_programming: {
        arrays: 'What is the time complexity of accessing an element in an array by index?',
        trees: 'What is the difference between a binary tree and a binary search tree?',
        graphs: 'Explain the difference between DFS and BFS traversal algorithms.'
      },
      upsc_preparation: {
        indian_polity: 'Explain the concept of separation of powers in the Indian Constitution.',
        geography: 'Discuss the factors affecting the climate of India.',
        current_affairs: 'Analyze the significance of recent policy changes in governance.'
      },
      jee_preparation: {
        physics_mechanics: 'A ball is thrown vertically upward. Derive the expression for maximum height reached.',
        chemistry_organic: 'Explain the mechanism of nucleophilic substitution reactions.',
        mathematics_calculus: 'Find the derivative of f(x) = x^3 + 2x^2 - 5x + 1.'
      },
      developer_skills: {
        frontend_development: 'What are the key differences between React and Angular frameworks?',
        backend_development: 'Explain the concepts of RESTful API design principles.',
        databases: 'Compare SQL and NoSQL databases with examples.'
      }
    };
    
    const domainQuestions = fallbackQuestions[domain] || {};
    let questionText = domainQuestions[topic] || `Explain the key concepts of ${topic} at ${difficulty} level.`;
    
    if (rawResponse) {
      questionText += `\n\n(Note: AI-generated content may need review)\n${rawResponse.substring(0, 500)}`;
    }
    
    return new Question(
      questionId,
      domain,
      topic,
      difficulty,
      questionType,
      questionText,
      [],
      '',
      'Please review the question content and provide appropriate explanation.',
      5.0
    );
  }

  async generateLearningContent(domain, topic, difficulty, contentType, userContext = null) {
    try {
      await this.waitForRateLimit();
      
      const template = this.contentTemplates[contentType] || 
        `Create ${contentType} content about {topic} at {difficulty} level.`;
      
      let prompt = template.replace('{topic}', topic)
                          .replace('{difficulty}', difficulty)
                          .replace('{content_type}', contentType);
      
      // Add context
      prompt += `\n\nDomain: ${domain}`;
      prompt += `\nTarget Audience: Learners at ${difficulty} level`;
      
      if (userContext) {
        prompt += `\nUser Context: ${JSON.stringify(userContext, null, 2)}`;
      }
      
      prompt += '\n\nGenerate comprehensive, well-structured learning content with clear explanations and practical examples.';
      
      const response = await this.callAIAPI(prompt);
      
      const contentId = `content_${domain}_${topic}_${contentType}_${Date.now()}`;
      
      return new LearningContent(
        contentId,
        domain,
        topic,
        contentType,
        `${topic.replace('_', ' ').toUpperCase()} - ${contentType.toUpperCase()}`,
        response,
        difficulty,
        response.split(' ').length / 200.0 // Assume 200 WPM reading speed
      );
      
    } catch (error) {
      console.error('Error generating learning content:', error);
      return this.createFallbackContent(domain, topic, difficulty, contentType);
    }
  }

  createFallbackContent(domain, topic, difficulty, contentType) {
    const contentId = `fallback_content_${domain}_${topic}_${Date.now()}`;
    
    const fallbackContent = `# ${topic.replace('_', ' ').toUpperCase()}

This is a placeholder for ${contentType} content about ${topic} at ${difficulty} level.

## Key Points to Cover:
- Fundamental concepts and definitions
- Practical applications and examples
- Common challenges and solutions
- Best practices and recommendations

*Note: This content needs to be reviewed and completed by an expert.*
`;
    
    return new LearningContent(
      contentId,
      domain,
      topic,
      contentType,
      `${topic.replace('_', ' ').toUpperCase()} - ${contentType.toUpperCase()}`,
      fallbackContent,
      difficulty,
      2.0
    );
  }

  async generatePersonalizedStudyPlan(userModel, domain, durationDays = 30) {
    try {
      await this.waitForRateLimit();
      
      const userAnalytics = userModel.getLearningAnalytics();
      
      const prompt = `Generate a ${durationDays}-day personalized study plan for the ${domain} domain.

User Profile:
- Knowledge State: ${JSON.stringify(userAnalytics.knowledgeState || {}, null, 2)}
- Overall Accuracy: ${(userAnalytics.overallAccuracy || 0.5).toFixed(2)}
- Learning Style Scores: ${JSON.stringify(userAnalytics.learningStyleScores || {}, null, 2)}
- Mastered Topics: ${userAnalytics.masteredTopics || []}
- Struggling Topics: ${userAnalytics.strugglingTopics || []}
- Cognitive Load Capacity: ${userAnalytics.cognitiveLoadCapacity || 0.7}
- Attention Span: ${userAnalytics.attentionSpanMinutes || 25} minutes

Domain Configuration:
${JSON.stringify(config.getDomainConfig(domain) || {}, null, 2)}

Create a comprehensive study plan with:
1. Daily topics and time allocation
2. Progressive difficulty adjustment
3. Regular review and assessment points
4. Accommodation for user's learning style and capacity
5. Specific goals and milestones

Output as structured JSON with daily breakdowns.
`;
      
      const response = await this.callAIAPI(prompt);
      
      try {
        const planData = JSON.parse(response);
        return planData;
      } catch (parseError) {
        // Fallback: extract JSON from response or create structured plan
        return this.createFallbackStudyPlan(userModel, domain, durationDays);
      }
      
    } catch (error) {
      console.error('Error generating study plan:', error);
      return this.createFallbackStudyPlan(userModel, domain, durationDays);
    }
  }

  createFallbackStudyPlan(userModel, domain, durationDays) {
    const domainConfig = config.getDomainConfig(domain);
    if (!domainConfig) {
      return { error: 'Domain configuration not found' };
    }
    
    const topics = domainConfig.topics;
    const strugglingTopics = Object.entries(userModel.knowledgeState)
      .filter(([topic, prob]) => prob < 0.3)
      .map(([topic]) => topic);
    
    // Simple round-robin allocation
    const dailyPlans = [];
    const topicsToFocus = strugglingTopics.length > 0 ? strugglingTopics : topics.slice(0, 5);
    
    for (let day = 1; day <= durationDays; day++) {
      const topicIndex = (day - 1) % topicsToFocus.length;
      const currentTopic = topicsToFocus[topicIndex];
      
      const dailyPlan = {
        day: day,
        topic: currentTopic,
        activities: [
          { type: 'study', duration: 20, content: `Review ${currentTopic} concepts` },
          { type: 'practice', duration: 25, content: `Solve ${currentTopic} problems` },
          { type: 'review', duration: 10, content: 'Review mistakes and key points' }
        ],
        goals: [`Improve understanding of ${currentTopic}`],
        assessment: { type: 'quiz', questions: 5 }
      };
      dailyPlans.push(dailyPlan);
    }
    
    return {
      domain: domain,
      duration_days: durationDays,
      daily_plans: dailyPlans,
      overall_goals: [`Master key concepts in ${domain}`, 'Improve problem-solving skills'],
      generated_at: new Date().toISOString()
    };
  }
}

// Content Manager for caching and storage
class ContentManager {
  constructor() {
    this.questionsCache = {};
    this.contentCache = {};
  }

  cacheQuestion(question) {
    const cacheKey = `${question.domain}_${question.topic}_${question.difficulty}_${question.questionType}`;
    if (!this.questionsCache[cacheKey]) {
      this.questionsCache[cacheKey] = [];
    }
    this.questionsCache[cacheKey].push(question);
    
    // Keep only last 10 questions per cache key
    this.questionsCache[cacheKey] = this.questionsCache[cacheKey].slice(-10);
  }

  getCachedQuestion(domain, topic, difficulty, questionType) {
    const cacheKey = `${domain}_${topic}_${difficulty}_${questionType}`;
    const questions = this.questionsCache[cacheKey] || [];
    return questions.length > 0 ? questions[Math.floor(Math.random() * questions.length)] : null;
  }

  cacheContent(content) {
    const cacheKey = `${content.domain}_${content.topic}_${content.difficulty}_${content.contentType}`;
    this.contentCache[cacheKey] = content;
  }

  getCachedContent(domain, topic, difficulty, contentType) {
    const cacheKey = `${domain}_${topic}_${difficulty}_${contentType}`;
    return this.contentCache[cacheKey] || null;
  }

  exportCache() {
    return {
      questions: Object.fromEntries(
        Object.entries(this.questionsCache).map(([k, v]) => [k, v.map(q => ({
          id: q.id,
          domain: q.domain,
          topic: q.topic,
          difficulty: q.difficulty,
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          hints: q.hints,
          estimatedTime: q.estimatedTime,
          createdAt: q.createdAt
        }))])
      ),
      content: Object.fromEntries(
        Object.entries(this.contentCache).map(([k, v]) => [k, {
          id: v.id,
          domain: v.domain,
          topic: v.topic,
          contentType: v.contentType,
          title: v.title,
          content: v.content,
          difficulty: v.difficulty,
          estimatedReadTime: v.estimatedReadTime,
          createdAt: v.createdAt
        }])
      ),
      exported_at: new Date().toISOString()
    };
  }

  importCache(cacheData) {
    if (cacheData.questions) {
      for (const [key, questionsData] of Object.entries(cacheData.questions)) {
        this.questionsCache[key] = questionsData.map(q => new Question(
          q.id, q.domain, q.topic, q.difficulty, q.questionType, q.questionText,
          q.options, q.correctAnswer, q.explanation, q.hints, q.estimatedTime
        ));
      }
    }
    
    if (cacheData.content) {
      for (const [key, contentData] of Object.entries(cacheData.content)) {
        this.contentCache[key] = new LearningContent(
          contentData.id, contentData.domain, contentData.topic, contentData.contentType,
          contentData.title, contentData.content, contentData.difficulty, contentData.estimatedReadTime
        );
      }
    }
  }
}

// Global content manager instance
const contentManager = new ContentManager();

export { 
  AIContentGenerator, 
  Question, 
  LearningContent, 
  ContentManager, 
  contentManager 
};
