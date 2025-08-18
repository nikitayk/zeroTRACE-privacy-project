const GPT4oAdapter = require('../models/gpt4o');

class TestValidator {
  constructor(gpt4oApiKey) {
    this.gpt4o = new GPT4oAdapter(gpt4oApiKey);
  }

  // Generate comprehensive test cases for DSA problems
  async generateTestCases(problemDescription, count = 15) {
    console.log('🧪 Generating comprehensive test cases...');
    
    try {
      const testCases = await this.gpt4o.generateTestCases(problemDescription, count);
      console.log(`✅ Generated ${count} test cases`);
      return this.parseTestCases(testCases);
    } catch (error) {
      console.error('❌ Test case generation failed:', error);
      throw new Error(`Test case generation failed: ${error.message}`);
    }
  }

  // Execute code against test cases
  async executeTestCases(code, language, testCases, problemDescription) {
    console.log('🧪 Executing test cases...');
    
    try {
      const results = await this.gpt4o.executeTestCases(code, language, testCases, problemDescription);
      console.log('✅ Test execution completed');
      return this.parseTestResults(results);
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw new Error(`Test execution failed: ${error.message}`);
    }
  }

  // Simulate code execution for specific input
  async simulateExecution(code, language, testInput) {
    console.log('🔄 Simulating code execution...');
    
    try {
      const simulation = await this.gpt4o.simulateCodeExecution(code, language, testInput);
      console.log('✅ Code simulation completed');
      return this.parseSimulationResults(simulation);
    } catch (error) {
      console.error('❌ Code simulation failed:', error);
      throw new Error(`Code simulation failed: ${error.message}`);
    }
  }

  // Analyze errors in failed code
  async analyzeErrors(failedCode, errorDetails, testCases) {
    console.log('🔍 Analyzing errors...');
    
    try {
      const analysis = await this.gpt4o.analyzeErrors(failedCode, errorDetails, testCases);
      console.log('✅ Error analysis completed');
      return this.parseErrorAnalysis(analysis);
    } catch (error) {
      console.error('❌ Error analysis failed:', error);
      throw new Error(`Error analysis failed: ${error.message}`);
    }
  }

  // Parse test cases from AI response
  parseTestCases(response) {
    const testCases = [];
    const lines = response.split('\n');
    let currentTestCase = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('test case') || trimmed.toLowerCase().includes('input:')) {
        if (currentTestCase) {
          testCases.push(currentTestCase);
        }
        currentTestCase = { input: '', output: '', description: '' };
      } else if (trimmed.toLowerCase().includes('input:') && currentTestCase) {
        const inputMatch = trimmed.match(/input:\s*(.+)/i);
        if (inputMatch) {
          currentTestCase.input = inputMatch[1].trim();
        }
      } else if (trimmed.toLowerCase().includes('output:') && currentTestCase) {
        const outputMatch = trimmed.match(/output:\s*(.+)/i);
        if (outputMatch) {
          currentTestCase.output = outputMatch[1].trim();
        }
      } else if (trimmed.toLowerCase().includes('description:') && currentTestCase) {
        const descMatch = trimmed.match(/description:\s*(.+)/i);
        if (descMatch) {
          currentTestCase.description = descMatch[1].trim();
        }
      }
    }

    if (currentTestCase) {
      testCases.push(currentTestCase);
    }

    return testCases.length > 0 ? testCases : this.getDefaultTestCases();
  }

  // Parse test results from AI response
  parseTestResults(response) {
    const results = {
      allPassed: true,
      passedTests: [],
      failedTests: [],
      totalTests: 0,
      errorMessages: [],
      performanceMetrics: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        executionTime: 'N/A'
      }
    };

    const lines = response.split('\n');
    let currentTest = null;
    let inErrorSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('test case') && trimmed.includes(':')) {
        currentTest = trimmed;
        results.totalTests++;
      } else if (trimmed.toLowerCase().includes('pass') || trimmed.toLowerCase().includes('✅')) {
        if (currentTest) {
          results.passedTests.push(currentTest);
        }
      } else if (trimmed.toLowerCase().includes('fail') || trimmed.toLowerCase().includes('❌')) {
        if (currentTest) {
          results.failedTests.push(currentTest);
          results.allPassed = false;
        }
      } else if (trimmed.toLowerCase().includes('error')) {
        inErrorSection = true;
        results.errorMessages.push(trimmed);
      } else if (inErrorSection && trimmed) {
        results.errorMessages.push(trimmed);
      } else if (trimmed.toLowerCase().includes('time complexity:')) {
        const match = trimmed.match(/time complexity:\s*(.+)/i);
        if (match) {
          results.performanceMetrics.timeComplexity = match[1].trim();
        }
      } else if (trimmed.toLowerCase().includes('space complexity:')) {
        const match = trimmed.match(/space complexity:\s*(.+)/i);
        if (match) {
          results.performanceMetrics.spaceComplexity = match[1].trim();
        }
      }
    }

    return results;
  }

  // Parse simulation results
  parseSimulationResults(response) {
    const results = {
      output: '',
      executionTrace: [],
      errors: [],
      memoryUsage: 'N/A',
      timeComplexity: 'O(n)'
    };

    const lines = response.split('\n');
    let inTrace = false;
    let inErrors = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('final output:')) {
        const match = trimmed.match(/final output:\s*(.+)/i);
        if (match) {
          results.output = match[1].trim();
        }
      } else if (trimmed.toLowerCase().includes('execution trace:')) {
        inTrace = true;
        inErrors = false;
      } else if (trimmed.toLowerCase().includes('errors:')) {
        inTrace = false;
        inErrors = true;
      } else if (inTrace && trimmed) {
        results.executionTrace.push(trimmed);
      } else if (inErrors && trimmed) {
        results.errors.push(trimmed);
      }
    }

    return results;
  }

  // Parse error analysis
  parseErrorAnalysis(response) {
    const analysis = {
      rootCause: '',
      specificIssues: [],
      missingEdgeCases: [],
      algorithmicProblems: [],
      suggestions: [],
      alternativeApproaches: []
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('root cause:')) {
        currentSection = 'rootCause';
        const match = trimmed.match(/root cause:\s*(.+)/i);
        if (match) {
          analysis.rootCause = match[1].trim();
        }
      } else if (trimmed.toLowerCase().includes('specific issues:')) {
        currentSection = 'specificIssues';
      } else if (trimmed.toLowerCase().includes('missing edge cases:')) {
        currentSection = 'missingEdgeCases';
      } else if (trimmed.toLowerCase().includes('algorithmic problems:')) {
        currentSection = 'algorithmicProblems';
      } else if (trimmed.toLowerCase().includes('suggestions:')) {
        currentSection = 'suggestions';
      } else if (trimmed.toLowerCase().includes('alternative approaches:')) {
        currentSection = 'alternativeApproaches';
      } else if (trimmed && currentSection) {
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const item = trimmed.substring(1).trim();
          switch (currentSection) {
            case 'specificIssues':
              analysis.specificIssues.push(item);
              break;
            case 'missingEdgeCases':
              analysis.missingEdgeCases.push(item);
              break;
            case 'algorithmicProblems':
              analysis.algorithmicProblems.push(item);
              break;
            case 'suggestions':
              analysis.suggestions.push(item);
              break;
            case 'alternativeApproaches':
              analysis.alternativeApproaches.push(item);
              break;
          }
        }
      }
    }

    return analysis;
  }

  // Get default test cases for fallback
  getDefaultTestCases() {
    return [
      {
        input: '[1, 2, 3, 4, 5]',
        output: '15',
        description: 'Basic positive numbers'
      },
      {
        input: '[-1, -2, -3]',
        output: '-1',
        description: 'All negative numbers'
      },
      {
        input: '[0]',
        output: '0',
        description: 'Single element'
      },
      {
        input: '[]',
        output: '0',
        description: 'Empty array'
      },
      {
        input: '[1, -2, 3, -4, 5]',
        output: '5',
        description: 'Mixed positive and negative'
      }
    ];
  }

  // Validate test case format
  validateTestCase(testCase) {
    const required = ['input', 'output'];
    for (const field of required) {
      if (!testCase[field]) {
        return false;
      }
    }
    return true;
  }

  // Get test case statistics
  getTestStatistics(testCases) {
    return {
      total: testCases.length,
      valid: testCases.filter(tc => this.validateTestCase(tc)).length,
      edgeCases: testCases.filter(tc => 
        tc.description && tc.description.toLowerCase().includes('edge')
      ).length,
      stressTests: testCases.filter(tc => 
        tc.description && tc.description.toLowerCase().includes('stress')
      ).length
    };
  }
}

module.exports = TestValidator; 