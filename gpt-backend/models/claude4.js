const axios = require('axios');

class Claude4Adapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = process.env.CLAUDE4_BASE_URL || 'https://api.a4f.co/v1';
    this.modelId = process.env.CLAUDE4_MODEL || 'provider-3/llama-3.3-70b';
  }

  async callAPI(messages, temperature = 0.1, maxTokens = 2000) {
    try {
      // If using an OpenAI-compatible provider (e.g., a4f), call chat/completions
      if (this.baseURL.includes('a4f.co') || this.baseURL.endsWith('/v1')) {
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model: this.modelId,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.choices[0].message.content;
      }

      // Default: Anthropic Messages API
      const response = await axios.post(`${this.baseURL}/messages`, {
        model: this.modelId,
        messages,
        max_tokens: maxTokens,
        temperature,
        system: 'You are an expert competitive programming assistant specializing in DSA problem solving.'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude-4 API Error:', error.response?.data || error.message);
      throw new Error(`Claude-4 API failed: ${error.message}`);
    }
  }

  // Phase 1: Problem Analysis (AND Gate with GPT-4.1)
  async analyzeProblem(problemDescription) {
    const messages = [
      {
        role: 'user',
        content: `Analyze this DSA problem comprehensively:

${problemDescription}

Provide:
1. Detailed problem breakdown
2. Input/Output specifications
3. All constraints and edge cases
4. Algorithm category identification
5. Difficulty assessment with reasoning
6. Potential approaches ranked by efficiency

Be thorough and analytical in your analysis.`
      }
    ];

    return await this.callAPI(messages, 0.1, 1500);
  }

  // Phase 2: Code Optimization
  async optimizeCode(code, language, originalProblem) {
    const messages = [
      {
        role: 'user',
        content: `Optimize this ${language} code for competitive programming without breaking the logic:

Original Problem:
${originalProblem}

Code to optimize:
\`\`\`${language}
${code}
\`\`\`

Optimization requirements:
1. Maintain exact same logic and functionality
2. Improve performance where possible
3. Optimize for competitive programming standards
4. Enhance readability and maintainability
5. Add necessary optimizations for ${language}

Output format (MANDATORY):
Return ONLY a single fenced code block with language tag ${language}. At the top, include a concise multi-line comment summarizing optimizations, approach, and complexities. No prose outside the code block.`
      }
    ];

    return await this.callAPI(messages, 0.1, 2000);
  }

  // Phase 3: Error Analysis & New Solution
  async analyzeErrorsAndCreateSolution(failedCode, errorDetails, testCases, originalProblem, language = 'cpp') {
    const messages = [
      {
        role: 'user',
        content: `Analyze the failed solution and create a new approach:

Original Problem:
${originalProblem}

Failed Code:
\`\`\`${language}
${failedCode}
\`\`\`

Error Details:
${errorDetails}

Failed Test Cases:
${testCases}

Create a completely new solution that:
1. Addresses the root cause of the failure
2. Uses a different algorithmic approach
3. Handles all edge cases properly
4. Follows competitive programming best practices
5. Is optimized for ${language}

Output format (MANDATORY):
Return ONLY a single fenced code block with language tag ${language}. At the top, include a multi-line comment explaining the new approach, fixes, and complexity. No prose outside the code block.`
      }
    ];

    return await this.callAPI(messages, 0.2, 2500);
  }
}

module.exports = Claude4Adapter; 