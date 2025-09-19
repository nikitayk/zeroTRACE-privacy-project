const axios = require('axios');

class GeminiAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = process.env.GEMINI_BASE_URL || 'https://api.a4f.co/v1';
    this.modelId = process.env.GEMINI_MODEL || 'provider-3/gpt-4.1-nano';
  }

  async callAPI(prompt, temperature = 0.1, maxTokens = 2000) {
    try {
      // If using OpenAI-compatible provider (e.g., a4f), use chat/completions
      if (this.baseURL.includes('a4f.co') || this.baseURL.endsWith('/v1')) {
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model: this.modelId,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
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

      // Default: Gemini generateContent API
      const response = await axios.post(`${this.baseURL}/${this.modelId}:generateContent?key=${this.apiKey}`, {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.9,
          topK: 40
        }
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  // Phase 3: Code Optimization
  async optimizeCode(code, language, originalProblem) {
    const prompt = `Optimize this ${language} code for competitive programming without breaking the logic:

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
Return ONLY a single fenced code block with language tag ${language}. At the top, include a concise multi-line comment explaining key optimizations, approach, and complexities. No prose outside the code block.`;

    return await this.callAPI(prompt, 0.1, 2000);
  }

  // Phase 4: Error Analysis & New Solution
  async analyzeErrorsAndCreateSolution(failedCode, errorDetails, testCases, originalProblem, language = 'cpp') {
    const prompt = `Analyze the failed solution and create a new approach:

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
Return ONLY a single fenced code block with language tag ${language}. At the top, include a multi-line comment explaining the new approach and complexity. No prose outside the code block.`;

    return await this.callAPI(prompt, 0.2, 2500);
  }
}

module.exports = GeminiAdapter; 