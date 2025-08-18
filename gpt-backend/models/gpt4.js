const axios = require('axios');

class GPT4Adapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = process.env.GPT4_BASE_URL || 'https://api.a4f.co/v1';
    this.modelId = process.env.GPT4_MODEL || 'provider-6/gpt-4.1';
  }

  async callAPI(messages, temperature = 0.1, maxTokens = 2000) {
    try {
       const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.modelId,
        messages,
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('GPT-4 API Error:', error.response?.data || error.message);
      throw new Error(`GPT-4 API failed: ${error.message}`);
    }
  }

  // Phase 1: Problem Analysis
  async analyzeProblem(problemDescription) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert DSA problem analyzer. Analyze the given problem and provide:
1. Problem summary and categorization
2. Input/Output format identification
3. Constraints extraction
4. Algorithm category suggestion
5. Difficulty assessment

Be precise and structured in your analysis.`
      },
      {
        role: 'user',
        content: `Analyze this DSA problem:\n\n${problemDescription}`
      }
    ];

    return await this.callAPI(messages, 0.1, 1000);
  }

  // Phase 2: Algorithm Selection & Implementation
  async selectAlgorithmAndImplement(problemAnalysis, language = 'cpp') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert competitive programming algorithm designer. Based on the problem analysis, select the optimal algorithm and implement it in ${language}.

Requirements:
1. Choose the most efficient algorithm
2. Implement with competitive programming best practices
3. Include proper edge case handling
4. Use optimal data structures
5. Follow ${language} coding standards

Output format (MANDATORY):
Return ONLY a single fenced code block with language tag ${language}. At the very top of the code, include a brief multi-line comment explaining approach, time and space complexity. No prose outside the code block.`
      },
      {
        role: 'user',
        content: `Problem Analysis:\n${problemAnalysis}\n\nImplement the optimal solution in ${language}.`
      }
    ];

    return await this.callAPI(messages, 0.1, 2000);
  }

  // Phase 5: Code Optimization
  async optimizeCode(code, language, originalProblem) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert code optimizer for competitive programming. Optimize the given code without breaking the logic.

Optimization goals:
1. Improve time/space complexity if possible
2. Optimize for competitive programming standards
3. Maintain correctness
4. Improve readability and maintainability
5. Add necessary optimizations for ${language}

Output format (MANDATORY):
Return ONLY a single fenced code block with language tag ${language}. Keep a concise multi-line header comment explaining key optimizations, approach, and complexity. No prose outside the code block.`
      },
      {
        role: 'user',
        content: `Original Problem:\n${originalProblem}\n\nCode to optimize:\n\`\`\`${language}\n${code}\n\`\`\`\n\nOptimize this code for competitive programming.`
      }
    ];

    return await this.callAPI(messages, 0.2, 2000);
  }
}

module.exports = GPT4Adapter; 