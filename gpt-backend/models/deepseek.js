const axios = require('axios');

class DeepSeekAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = process.env.DEEPSEEK_BASE_URL || 'https://openrouter.ai/api/v1';
    this.modelId = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1-0528:free';
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
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error(`DeepSeek API failed: ${error.message}`);
    }
  }

  // Phase 4: Code Optimization
  async optimizeCode(code, language, originalProblem) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert code optimizer for competitive programming. Optimize the given code without breaking the logic.`
      },
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

  // Phase 5: Final Solution Attempt
  async createFinalSolution(failedCode, errorDetails, testCases, originalProblem, language = 'cpp') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert competitive programming problem solver. Create a robust solution that handles all edge cases and follows best practices.`
      },
      {
        role: 'user',
        content: `Create a final solution for this problem:

Original Problem:
${originalProblem}

Previous Failed Code:
\`\`\`${language}
${failedCode}
\`\`\`

Error Details:
${errorDetails}

Failed Test Cases:
${testCases}

Create a robust solution that:
1. Addresses all previous failures
2. Uses the most appropriate algorithm
3. Handles all edge cases properly
4. Follows competitive programming best practices
5. Is optimized for ${language}
6. Includes comprehensive error handling

Output format (MANDATORY):
Return ONLY a single fenced code block with language tag ${language}. At the top, include a multi-line comment explaining the approach, how it fixes previous issues, and complexity. No prose outside the code block.`
      }
    ];

    return await this.callAPI(messages, 0.1, 3000);
  }
}

module.exports = DeepSeekAdapter; 