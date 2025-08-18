const Phase1Controller = require('./phase1');
const Phase2Controller = require('./phase2');
const Phase3Controller = require('./phase3');
const Phase4Controller = require('./phase4');
const Phase5Controller = require('./phase5');

class PipelineOrchestrator {
  constructor(config) {
    this.config = config;
    
    // Initialize all phase controllers
    this.phase1 = new Phase1Controller(
      process.env.GPT4_API_KEY || config.gpt4ApiKey || '',
      process.env.CLAUDE4_API_KEY || config.claude4ApiKey || ''
    );
    
    this.phase2 = new Phase2Controller(
      process.env.GPT4_API_KEY || config.gpt4ApiKey || '',
      process.env.CLAUDE4_API_KEY || config.claude4ApiKey || '',
      process.env.GPT4O_API_KEY || config.gpt4oApiKey || ''
    );
    
    this.phase3 = new Phase3Controller(
      process.env.CLAUDE4_API_KEY || config.claude4ApiKey || '',
      process.env.GEMINI_API_KEY || config.geminiApiKey || '',
      process.env.GPT4O_API_KEY || config.gpt4oApiKey || ''
    );
    
    this.phase4 = new Phase4Controller(
      process.env.GEMINI_API_KEY || config.geminiApiKey || '',
      process.env.DEEPSEEK_API_KEY || config.deepseekApiKey || '',
      process.env.GPT4O_API_KEY || config.gpt4oApiKey || ''
    );
    
    this.phase5 = new Phase5Controller(
      process.env.DEEPSEEK_API_KEY || config.deepseekApiKey || '',
      process.env.GPT4_API_KEY || config.gpt4ApiKey || '',
      process.env.GPT4O_API_KEY || config.gpt4oApiKey || ''
    );
  }

  async solveDSAProblem(problemDescription, language = 'cpp') {
    console.log('🎯 Starting Sequential AI Pipeline for DSA Problem Solving');
    console.log(`📝 Problem: ${problemDescription.substring(0, 100)}...`);
    console.log(`🔧 Language: ${language}`);
    
    const startTime = Date.now();
    const pipelineResults = {
      success: false,
      finalPhase: 0,
      totalExecutionTime: 0,
      phases: [],
      finalSolution: null,
      errorDetails: null
    };

    try {
      // Phase 1: Problem Analysis (AND Gate)
      console.log('\n🔄 Phase 1: Problem Analysis (GPT-4.1 + Claude-4 Opus)');
      const phase1Result = await this.phase1.execute(problemDescription);
      pipelineResults.phases.push(phase1Result);
      
      if (!phase1Result.success) {
        throw new Error(`Phase 1 failed: ${phase1Result.error}`);
      }

      // Phase 2: First Solution Attempt
      console.log('\n🔄 Phase 2: First Solution Attempt (GPT-4.1 → Claude-4 → GPT-4o)');
      const phase2Result = await this.phase2.execute(phase1Result.analysis, language);
      pipelineResults.phases.push(phase2Result);
      
      if (phase2Result.success) {
        console.log('✅ Solution found in Phase 2!');
        pipelineResults.success = true;
        pipelineResults.finalPhase = 2;
        pipelineResults.finalSolution = {
          code: phase2Result.code,
          testResults: phase2Result.testResults,
          testCases: phase2Result.testCases,
          phase: 2
        };
      } else {
        console.log('❌ Phase 2 failed, proceeding to Phase 3...');
        
        // Phase 3: Second Solution Attempt
        console.log('\n🔄 Phase 3: Second Solution Attempt (Claude-4 → Gemini → GPT-4o)');
        const phase3Result = await this.phase3.execute(
          phase1Result.analysis,
          phase2Result.code,
          phase2Result.errorDetails,
          phase2Result.testCases,
          language
        );
        pipelineResults.phases.push(phase3Result);
        
        if (phase3Result.success) {
          console.log('✅ Solution found in Phase 3!');
          pipelineResults.success = true;
          pipelineResults.finalPhase = 3;
          pipelineResults.finalSolution = {
            code: phase3Result.code,
            testResults: phase3Result.testResults,
            testCases: phase3Result.testCases,
            phase: 3
          };
        } else {
          console.log('❌ Phase 3 failed, proceeding to Phase 4...');
          
          // Phase 4: Third Solution Attempt
          console.log('\n🔄 Phase 4: Third Solution Attempt (Gemini → DeepSeek → GPT-4o)');
          const phase4Result = await this.phase4.execute(
            phase1Result.analysis,
            phase3Result.code,
            phase3Result.errorDetails,
            phase3Result.testCases,
            language
          );
          pipelineResults.phases.push(phase4Result);
          
          if (phase4Result.success) {
            console.log('✅ Solution found in Phase 4!');
            pipelineResults.success = true;
            pipelineResults.finalPhase = 4;
            pipelineResults.finalSolution = {
              code: phase4Result.code,
              testResults: phase4Result.testResults,
              testCases: phase4Result.testCases,
              phase: 4
            };
          } else {
            console.log('❌ Phase 4 failed, proceeding to Phase 5...');
            
            // Phase 5: Final Solution Attempt
            console.log('\n🔄 Phase 5: Final Solution Attempt (DeepSeek → GPT-4.1 → GPT-4o)');
            const phase5Result = await this.phase5.execute(
              phase1Result.analysis,
              phase4Result.code,
              phase4Result.errorDetails,
              phase4Result.testCases,
              language
            );
            pipelineResults.phases.push(phase5Result);
            
            if (phase5Result.success) {
              console.log('✅ Solution found in Phase 5!');
              pipelineResults.success = true;
              pipelineResults.finalPhase = 5;
              pipelineResults.finalSolution = {
                code: phase5Result.code,
                testResults: phase5Result.testResults,
                testCases: phase5Result.testCases,
                phase: 5
              };
            } else {
              console.log('❌ All phases failed. Problem could not be solved.');
              pipelineResults.success = false;
              pipelineResults.finalPhase = 5;
              pipelineResults.errorDetails = phase5Result.errorDetails;
            }
          }
        }
      }

      // Calculate total execution time
      pipelineResults.totalExecutionTime = Date.now() - startTime;
      
      // Log final results
      console.log('\n📊 Pipeline Results:');
      console.log(`✅ Success: ${pipelineResults.success}`);
      console.log(`🎯 Final Phase: ${pipelineResults.finalPhase}`);
      console.log(`⏱️ Total Time: ${pipelineResults.totalExecutionTime}ms`);
      
      if (pipelineResults.success) {
        console.log(`📝 Solution found in Phase ${pipelineResults.finalPhase}`);
        console.log(`🧪 Test Results: ${pipelineResults.finalSolution.testResults.passedTests.length}/${pipelineResults.finalSolution.testResults.totalTests} passed`);
      } else {
        console.log('❌ No solution found after all phases');
      }

      return pipelineResults;

    } catch (error) {
      console.error('💥 Pipeline execution failed:', error.message);
      pipelineResults.success = false;
      pipelineResults.totalExecutionTime = Date.now() - startTime;
      pipelineResults.errorDetails = error.message;
      return pipelineResults;
    }
  }

  // Helper method to get detailed phase information
  getPhaseDetails(phaseNumber) {
    const phaseDetails = {
      1: {
        name: 'Problem Analysis',
        models: ['GPT-4.1', 'Claude-4 Opus'],
        logic: 'AND Gate (both must succeed)',
        description: 'Analyze problem, categorize, extract constraints'
      },
      2: {
        name: 'First Solution Attempt',
        models: ['GPT-4.1', 'Claude-4 Opus', 'GPT-4o'],
        logic: 'Sequential: Algorithm → Optimization → Testing',
        description: 'Select algorithm, implement, optimize, test'
      },
      3: {
        name: 'Second Solution Attempt',
        models: ['Claude-4 Opus', 'Gemini-2.5 Pro', 'GPT-4o'],
        logic: 'Error Analysis → New Solution → Optimization → Testing',
        description: 'Analyze previous errors, create new approach'
      },
      4: {
        name: 'Third Solution Attempt',
        models: ['Gemini-2.5 Pro', 'DeepSeek R1', 'GPT-4o'],
        logic: 'Error Analysis → New Solution → Optimization → Testing',
        description: 'Try different algorithmic approach'
      },
      5: {
        name: 'Final Solution Attempt',
        models: ['DeepSeek R1', 'GPT-4.1', 'GPT-4o'],
        logic: 'Final Attempt → Optimization → Testing',
        description: 'Last attempt with most robust approach'
      }
    };

    return phaseDetails[phaseNumber] || null;
  }
}

module.exports = PipelineOrchestrator; 