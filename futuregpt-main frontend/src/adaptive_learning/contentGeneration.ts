// AI-Powered Content Generation for Adaptive Learning
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { storageManager } from './storage';

export interface Question {
  id: string;
  domain: string;
  topic: string;
  difficulty: string;
  questionType: string; // 'mcq', 'subjective', 'practical', 'case_study'
  questionText: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  hints: string[];
  estimatedTime: number; // minutes
  tags: string[];
  createdAt: number;
}

export interface LearningContent {
  id: string;
  domain: string;
  topic: string;
  contentType: string; // 'explanation', 'example', 'tutorial', 'summary'
  title: string;
  content: string;
  difficulty: string;
  estimatedReadTime: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  createdAt: number;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  tokenUsage?: Record<string, number>;
}

export class AIContentGenerator {
  private questionTemplates: Record<string, Record<string, string>>;
  private contentTemplates: Record<string, string>;
  private rateLimiter: Map<string, number[]> = new Map();
  private maxRequestsPerMinute = 50;

  constructor() {
    this.questionTemplates = this.loadQuestionTemplates();
    this.contentTemplates = this.loadContentTemplates();
  }

  private loadQuestionTemplates(): Record<string, Record<string, string>> {
    return {
      dsa_programming: {
        mcq: "Create a multiple-choice question about {topic} at {difficulty} level. Include 4 options with one correct answer and explanation.",
        practical: "Create a coding problem about {topic} at {difficulty} level. Include problem statement, input/output format, constraints, and sample test cases.",
        subjective: "Create a theoretical question about {topic} at {difficulty} level that requires explanation of concepts."
      },
      upsc_preparation: {
        mcq: "Create a UPSC-style multiple-choice question on {topic} at {difficulty} level. Include 4 options and detailed explanation.",
        subjective: "Create a UPSC mains-style question on {topic} at {difficulty} level for essay writing or descriptive answer.",
        case_study: "Create a case study question on {topic} at {difficulty} level with scenario analysis."
      },
      jee_preparation: {
        mcq: "Create a JEE-style multiple-choice question on {topic} at {difficulty} level with 4 options and step-by-step solution.",
        subjective: "Create a JEE subjective question on {topic} at {difficulty} level that requires mathematical derivation or proof.",
        practical: "Create a JEE numerical problem on {topic} at {difficulty} level with given data and required calculations."
      },
      developer_skills: {
        mcq: "Create a technical interview question about {topic} at {difficulty} level with multiple-choice options.",
        practical: "Create a hands-on coding/implementation task for {topic} at {difficulty} level.",
        case_study: "Create a system design or architecture question about {topic} at {difficulty} level."
      }
    };
  }

  private loadContentTemplates(): Record<string, string> {
    return {
      explanation: "Provide a clear and comprehensive explanation of {topic} at {difficulty} level. Include key concepts, examples, and practical applications.",
      tutorial: "Create a step-by-step tutorial on {topic} at {difficulty} level. Include practical examples and hands-on exercises.",
      summary: "Create a concise summary of {topic} at {difficulty} level covering the most important points.",
      example: "Provide detailed examples and use cases for {topic} at {difficulty} level with explanations."
    };
  }

  async generateQuestion(
    domain: string,
    topic: string,
    difficulty: string,
    questionType: string,
    userContext?: Record<string, any>
  ): Promise<Question> {
    try {
      // Check cache first
      const cacheKey = `${domain}_${topic}_${difficulty}_${questionType}`;
      const cachedQuestion = await storageManager.getCachedContent(cacheKey);
      
      if (cachedQuestion) {
        return cachedQuestion as Question;
      }

      // Get appropriate template
      const domainTemplates = this.questionTemplates[domain] || {};
      const template = domainTemplates[questionType] || 
        `Create a ${questionType} question about {topic} at {difficulty} level.`;

      // Build prompt with context
      const prompt = this.buildQuestionPrompt(template, domain, topic, difficulty, questionType, userContext);

      // Generate content using AI
      const response = await this.callAIAPI(prompt);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate question');
      }

      // Parse response into Question object
      const question = this.parseQuestionResponse(response.data, domain, topic, difficulty, questionType);

      // Cache the generated question
      await storageManager.cacheContent(cacheKey, question);

      return question;
    } catch (error) {
      console.error('Error generating question:', error);
      // Return fallback question
      return this.createFallbackQuestion(domain, topic, difficulty, questionType);
    }
  }

  private buildQuestionPrompt(
    template: string,
    domain: string,
    topic: string,
    difficulty: string,
    questionType: string,
    userContext?: Record<string, any>
  ): string {
    let prompt = template
      .replace('{topic}', topic)
      .replace('{difficulty}', difficulty)
      .replace('{questionType}', questionType);

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

  private getDomainContext(domain: string): string {
    const contexts: Record<string, string> = {
      dsa_programming: "Focus on algorithms, data structures, time/space complexity, and coding best practices. Questions should be relevant for technical interviews and competitive programming.",
      upsc_preparation: "Focus on Indian administration, governance, current affairs, and analytical thinking. Questions should match UPSC exam patterns and difficulty levels.",
      jee_preparation: "Focus on Physics, Chemistry, and Mathematics concepts. Questions should match JEE exam patterns with appropriate difficulty and numerical problems.",
      developer_skills: "Focus on modern software development practices, technologies, and real-world application scenarios. Questions should be relevant for software development roles."
    };
    return contexts[domain] || "Generate educationally sound questions appropriate for the learning context.";
  }

  private getOutputFormatSpec(questionType: string): string {
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

  private async callAIAPI(prompt: string): Promise<APIResponse> {
    const startTime = Date.now();

    try {
      // Check rate limiting
      if (!this.canMakeRequest()) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }

      if (!config.apiConfig.baseUrl || !config.apiConfig.apiKey) {
        throw new Error('AI API not configured. Please provide base_url and api_key.');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${config.apiConfig.apiKey}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        model: config.apiConfig.modelName,
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
        max_tokens: config.apiConfig.maxTokens,
        temperature: config.apiConfig.temperature
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.apiConfig.timeout);

      const response = await fetch(`${config.apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Record the request for rate limiting
      this.recordRequest();

      return {
        success: true,
        data: content,
        responseTime: Date.now() - startTime,
        tokenUsage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    const minuteAgo = now - 60 * 1000;
    
    // Get or create request history for this minute
    const requestHistory = this.rateLimiter.get('requests') || [];
    
    // Remove old requests
    const recentRequests = requestHistory.filter(time => time > minuteAgo);
    
    // Check if we can make a request
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }
    
    // Update the history
    this.rateLimiter.set('requests', recentRequests);
    return true;
  }

  private recordRequest(): void {
    const now = Date.now();
    const requestHistory = this.rateLimiter.get('requests') || [];
    requestHistory.push(now);
    this.rateLimiter.set('requests', requestHistory);
  }

  private parseQuestionResponse(
    response: string,
    domain: string,
    topic: string,
    difficulty: string,
    questionType: string
  ): Question {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      const questionId = `${domain}_${topic}_${difficulty}_${Date.now()}`;

      // Handle different response formats
      if (questionType === 'mcq') {
        return {
          id: questionId,
          domain,
          topic,
          difficulty,
          questionType,
          questionText: data.question || '',
          options: data.options || [],
          correctAnswer: data.correct_answer || '',
          explanation: data.explanation || '',
          hints: data.hints || [],
          estimatedTime: data.estimated_time || 5.0,
          tags: [domain, topic, difficulty, questionType],
          createdAt: Date.now()
        };
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

        return {
          id: questionId,
          domain,
          topic,
          difficulty,
          questionType,
          questionText,
          correctAnswer: data.explanation || '',
          explanation: data.explanation || '',
          hints: data.hints || [],
          estimatedTime: data.estimated_time || 15.0,
          tags: [domain, topic, difficulty, questionType],
          createdAt: Date.now()
        };
      } else {
        // Subjective/case study
        let questionText = data.question || '';
        if (data.answer_guidelines) {
          questionText += `\n\nAnswer Guidelines: ${data.answer_guidelines}`;
        }

        return {
          id: questionId,
          domain,
          topic,
          difficulty,
          questionType,
          questionText,
          correctAnswer: data.explanation || '',
          explanation: data.explanation || '',
          hints: data.key_points || [],
          estimatedTime: data.estimated_time || 8.0,
          tags: [domain, topic, difficulty, questionType],
          createdAt: Date.now()
        };
      }
    } catch (error) {
      console.error('Error parsing question response:', error);
      return this.createFallbackQuestion(domain, topic, difficulty, questionType, response);
    }
  }

  private createFallbackQuestion(
    domain: string,
    topic: string,
    difficulty: string,
    questionType: string,
    rawResponse?: string
  ): Question {
    const questionId = `fallback_${domain}_${topic}_${Date.now()}`;

    const fallbackQuestions: Record<string, Record<string, string>> = {
      dsa_programming: {
        arrays: "What is the time complexity of accessing an element in an array by index?",
        trees: "What is the difference between a binary tree and a binary search tree?",
        graphs: "Explain the difference between DFS and BFS traversal algorithms."
      },
      upsc_preparation: {
        indian_polity: "Explain the concept of separation of powers in the Indian Constitution.",
        geography: "Discuss the factors affecting the climate of India.",
        current_affairs: "Analyze the significance of recent policy changes in governance."
      },
      jee_preparation: {
        physics_mechanics: "A ball is thrown vertically upward. Derive the expression for maximum height reached.",
        chemistry_organic: "Explain the mechanism of nucleophilic substitution reactions.",
        mathematics_calculus: "Find the derivative of f(x) = x^3 + 2x^2 - 5x + 1."
      },
      developer_skills: {
        frontend_development: "What are the key differences between React and Angular frameworks?",
        backend_development: "Explain the concepts of RESTful API design principles.",
        databases: "Compare SQL and NoSQL databases with examples."
      }
    };

    const domainQuestions = fallbackQuestions[domain] || {};
    let questionText = domainQuestions[topic] || `Explain the key concepts of ${topic} at ${difficulty} level.`;

    if (rawResponse) {
      questionText += `\n\n(Note: AI-generated content may need review)\n${rawResponse.substring(0, 500)}`;
    }

    return {
      id: questionId,
      domain,
      topic,
      difficulty,
      questionType,
      questionText,
      correctAnswer: '',
      explanation: "Please review the question content and provide appropriate explanation.",
      hints: [],
      estimatedTime: 5.0,
      tags: [domain, topic, difficulty, questionType],
      createdAt: Date.now()
    };
  }

  async generateLearningContent(
    domain: string,
    topic: string,
    difficulty: string,
    contentType: string,
    userContext?: Record<string, any>
  ): Promise<LearningContent> {
    try {
      const template = this.contentTemplates[contentType] || 
        `Create ${contentType} content about {topic} at {difficulty} level.`;

      let prompt = template
        .replace('{topic}', topic)
        .replace('{difficulty}', difficulty)
        .replace('{contentType}', contentType);

      // Add context
      prompt += `\n\nDomain: ${domain}`;
      prompt += `\nTarget Audience: Learners at ${difficulty} level`;

      if (userContext) {
        prompt += `\nUser Context: ${JSON.stringify(userContext, null, 2)}`;
      }

      prompt += '\n\nGenerate comprehensive, well-structured learning content with clear explanations and practical examples.';

      const response = await this.callAIAPI(prompt);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate content');
      }

      const contentId = `content_${domain}_${topic}_${contentType}_${Date.now()}`;

      return {
        id: contentId,
        domain,
        topic,
        contentType,
        title: `${topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
        content: response.data,
        difficulty,
        estimatedReadTime: response.data.split(' ').length / 200.0, // Assume 200 WPM reading speed
        prerequisites: [],
        learningObjectives: [],
        createdAt: Date.now()
      };
    } catch (error) {
      console.error('Error generating learning content:', error);
      return this.createFallbackContent(domain, topic, difficulty, contentType);
    }
  }

  private createFallbackContent(
    domain: string,
    topic: string,
    difficulty: string,
    contentType: string
  ): LearningContent {
    const contentId = `fallback_content_${domain}_${topic}_${Date.now()}`;

    const fallbackContent = `# ${topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}

This is a placeholder for ${contentType} content about ${topic} at ${difficulty} level.

## Key Points to Cover:
- Fundamental concepts and definitions
- Practical applications and examples
- Common challenges and solutions
- Best practices and recommendations

*Note: This content needs to be reviewed and completed by an expert.*`;

    return {
      id: contentId,
      domain,
      topic,
      contentType,
      title: `${topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      content: fallbackContent,
      difficulty,
      estimatedReadTime: 2.0,
      prerequisites: [],
      learningObjectives: [],
      createdAt: Date.now()
    };
  }

  async generatePersonalizedStudyPlan(
    userModel: any,
    domain: string,
    durationDays: number = 30
  ): Promise<Record<string, any>> {
    try {
      const prompt = `Generate a ${durationDays}-day personalized study plan for the ${domain} domain.

User Profile:
- Knowledge State: ${JSON.stringify(userModel.knowledgeState || {}, null, 2)}
- Overall Accuracy: ${(userModel.averageAccuracy || 0.5).toFixed(2)}
- Learning Style Scores: ${JSON.stringify(userModel.learningStyleScores || {}, null, 2)}
- Mastered Topics: ${JSON.stringify(userModel.masteredTopics || [], null, 2)}
- Struggling Topics: ${JSON.stringify(userModel.strugglingTopics || [], null, 2)}
- Cognitive Load Capacity: ${userModel.cognitiveLoadCapacity || 0.7}
- Attention Span: ${userModel.attentionSpanMinutes || 25} minutes

Domain Configuration:
${JSON.stringify(config.getDomainConfig(domain) || {}, null, 2)}

Create a comprehensive study plan with:
1. Daily topics and time allocation
2. Progressive difficulty adjustment
3. Regular review and assessment points
4. Accommodation for user's learning style and capacity
5. Specific goals and milestones

Output as structured JSON with daily breakdowns.`;

      const response = await this.callAIAPI(prompt);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate study plan');
      }

      try {
        const planData = JSON.parse(response.data);
        return planData;
      } catch {
        // Fallback: create structured plan
        return this.createFallbackStudyPlan(userModel, domain, durationDays);
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      return this.createFallbackStudyPlan(userModel, domain, durationDays);
    }
  }

  private createFallbackStudyPlan(userModel: any, domain: string, durationDays: number): Record<string, any> {
    const domainConfig = config.getDomainConfig(domain);
    if (!domainConfig) {
      return { error: 'Domain configuration not found' };
    }

    const topics = domainConfig.topics;
    const strugglingTopics = Object.entries(userModel.knowledgeState || {})
      .filter(([_, prob]: [string, any]) => prob < 0.3)
      .map(([topic, _]) => topic);

    // Simple round-robin allocation
    const dailyPlans = [];
    const topicsToFocus = strugglingTopics.length > 0 ? strugglingTopics : topics.slice(0, 5);

    for (let day = 1; day <= durationDays; day++) {
      const topicIndex = (day - 1) % topicsToFocus.length;
      const currentTopic = topicsToFocus[topicIndex];

      const dailyPlan = {
        day,
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
      domain,
      durationDays,
      dailyPlans,
      overallGoals: [`Master key concepts in ${domain}`, 'Improve problem-solving skills'],
      generatedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const contentGenerator = new AIContentGenerator();
