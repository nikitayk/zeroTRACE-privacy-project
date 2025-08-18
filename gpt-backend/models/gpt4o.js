const axios = require('axios');

class GPT4oAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = process.env.GPT4O_BASE_URL || 'https://api.a4f.co/v1';
    this.modelId = process.env.GPT4O_MODEL || 'provider-6/gpt-4.1-mini';
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
      console.error('GPT-4o API Error:', error.response?.data || error.message);
      throw new Error(`GPT-4o API failed: ${error.message}`);
    }
  }

  // Test Case Generation
  async generateTestCases(problemDescription, count = 10) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert at generating comprehensive test cases for DSA problems. Generate diverse test cases that cover normal cases, edge cases, boundary conditions, and stress tests.`
      },
      {
        role: 'user',
        content: `Generate ${count} comprehensive test cases for this problem:

${problemDescription}

Include:
1. Normal cases (typical inputs)
2. Edge cases (empty input, single element, etc.)
3. Boundary conditions (maximum/minimum values)
4. Stress test cases (large inputs)
5. Corner cases (unusual but valid inputs)

For each test case provide:
- Input format
- Expected output
- Brief description of what it tests

Format the response as a structured list.`
      }
    ];

    return await this.callAPI(messages, 0.3, 1500);
  }

  // Test Case Execution and Validation
  async executeTestCases(code, language, testCases, problemDescription) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert code execution validator. Analyze the given code and test cases to determine if the solution is correct.`
      },
      {
        role: 'user',
        content: `Execute and validate this ${language} code against the test cases:

Problem Description:
${problemDescription}

Code:
\`\`\`${language}
${code}
\`\`\`

Test Cases:
${testCases}

Analyze the code execution and provide:
1. Pass/Fail status for each test case
2. Detailed error analysis for failed cases
3. Time and space complexity analysis
4. Potential issues or edge cases missed
5. Overall correctness assessment

If any test cases fail, provide detailed error information including:
- Expected vs actual output
- Error messages
- Line numbers where issues occur
- Suggestions for fixing the code`
      }
    ];

    return await this.callAPI(messages, 0.1, 2000);
  }

  // Code Execution Simulation
  async simulateCodeExecution(code, language, testInput) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert code execution simulator. Simulate the execution of the given code with the provided input and return the expected output.`
      },
      {
        role: 'user',
        content: `Simulate the execution of this ${language} code with the given input:

Code:
\`\`\`${language}
${code}
\`\`\`

Input:
${testInput}

Provide:
1. Step-by-step execution trace
2. Final output
3. Any potential runtime errors
4. Memory usage analysis
5. Time complexity analysis for this specific input`
      }
    ];

    return await this.callAPI(messages, 0.1, 1500);
  }

  // Error Analysis
  async analyzeErrors(failedCode, errorDetails, testCases) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert at analyzing code errors and providing detailed debugging information.`
      },
      {
        role: 'user',
        content: `Analyze these errors in the code:

Failed Code:
\`\`\`
${failedCode}
\`\`\`

Error Details:
${errorDetails}

Failed Test Cases:
${testCases}

Provide detailed analysis including:
1. Root cause of the errors
2. Specific issues in the code
3. Missing edge case handling
4. Algorithmic problems
5. Suggestions for fixing the code
6. Alternative approaches to consider`
      }
    ];

    return await this.callAPI(messages, 0.2, 2000);
  }
}

module.exports = GPT4oAdapter; 