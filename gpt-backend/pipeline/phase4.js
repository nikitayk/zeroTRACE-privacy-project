const GeminiAdapter = require('../models/gemini');
const DeepSeekAdapter = require('../models/deepseek');
const GPT4oAdapter = require('../models/gpt4o');

class Phase4Controller {
  constructor(geminiApiKey, deepseekApiKey, gpt4oApiKey) {
    this.gemini = new GeminiAdapter(geminiApiKey);
    this.deepseek = new DeepSeekAdapter(deepseekApiKey);
    this.gpt4o = new GPT4oAdapter(gpt4oApiKey);
  }

  async execute(problemAnalysis, failedCode, errorDetails, testCases, language = 'cpp') {
    console.log('🚀 Phase 4: Third Solution Attempt');
    const startTime = Date.now();

    try {
      // Step 1: Gemini analyzes errors and creates new solution
      console.log('🔍 Step 1: Gemini Error Analysis & New Solution');
      const newSolution = await this.gemini.analyzeErrorsAndCreateSolution(
        failedCode,
        errorDetails,
        testCases,
        JSON.stringify(problemAnalysis),
        language
      );

      // Step 2: DeepSeek optimizes the new code
      console.log('⚡ Step 2: DeepSeek Code Optimization');
      const optimizedCode = await this.deepseek.optimizeCode(
        this.extractCode(newSolution, language),
        language,
        JSON.stringify(problemAnalysis)
      );

      // Step 3: GPT-4o executes test cases
      console.log('🧪 Step 3: GPT-4o Test Case Execution');
      const optimized = this.extractCode(optimizedCode, language);
      const fresh = this.extractCode(newSolution, language);
      const finalCode = optimized && optimized.length > 10 ? optimized : fresh;
      const testResults = await this.gpt4o.executeTestCases(
        finalCode,
        language,
        testCases,
        JSON.stringify(problemAnalysis)
      );

      // Analyze test results
      const testAnalysis = this.analyzeTestResults(testResults);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Phase 4 completed in ${executionTime}ms`);

      return {
        success: testAnalysis.allPassed,
        phase: 4,
        executionTime,
        code: finalCode,
        testResults: testAnalysis,
        testCases,
        newSolution: this.extractCode(newSolution, language),
        optimizedCode: finalCode,
        errorDetails: testAnalysis.failedTests.length > 0 ? testAnalysis.failedTests : null
      };

    } catch (error) {
      console.error('❌ Phase 4 failed:', error.message);
      return {
        success: false,
        phase: 4,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  extractCode(response, language) {
    // Extract code from AI response
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }

    // Fallback: look for code blocks without language specification
    const genericCodeRegex = /```\n([\s\S]*?)```/;
    const genericMatch = response.match(genericCodeRegex);
    
    if (genericMatch) {
      return genericMatch[1].trim();
    }

    // Last resort: return the entire response
    return response;
  }

  analyzeTestResults(testResults) {
    const lines = testResults.split('\n');
    const analysis = {
      allPassed: true,
      passedTests: [],
      failedTests: [],
      totalTests: 0,
      errorMessages: []
    };

    let currentTest = null;
    let inErrorSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('test case') && trimmed.includes(':')) {
        currentTest = trimmed;
        analysis.totalTests++;
      } else if (trimmed.toLowerCase().includes('pass') || trimmed.toLowerCase().includes('✅')) {
        if (currentTest) {
          analysis.passedTests.push(currentTest);
        }
      } else if (trimmed.toLowerCase().includes('fail') || trimmed.toLowerCase().includes('❌')) {
        if (currentTest) {
          analysis.failedTests.push(currentTest);
          analysis.allPassed = false;
        }
      } else if (trimmed.toLowerCase().includes('error')) {
        inErrorSection = true;
        analysis.errorMessages.push(trimmed);
      } else if (inErrorSection && trimmed) {
        analysis.errorMessages.push(trimmed);
      }
    }

    return analysis;
  }
}

module.exports = Phase4Controller; 