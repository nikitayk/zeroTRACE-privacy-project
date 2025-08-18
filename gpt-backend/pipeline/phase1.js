const GPT4Adapter = require('../models/gpt4');
const Claude4Adapter = require('../models/claude4');

class Phase1Controller {
  constructor(gpt4ApiKey, claude4ApiKey) {
    this.gpt4 = new GPT4Adapter(gpt4ApiKey);
    this.claude4 = new Claude4Adapter(claude4ApiKey);
  }

  async execute(problemDescription) {
    console.log('🚀 Phase 1: Problem Analysis (AND Gate)');
    const startTime = Date.now();

    try {
      // Execute both models in parallel (AND Gate)
      const [gpt4Analysis, claude4Analysis] = await Promise.all([
        this.gpt4.analyzeProblem(problemDescription),
        this.claude4.analyzeProblem(problemDescription)
      ]);

      // Merge and synthesize the analyses
      const mergedAnalysis = this.mergeAnalyses(gpt4Analysis, claude4Analysis);

      const executionTime = Date.now() - startTime;
      console.log(`✅ Phase 1 completed in ${executionTime}ms`);

      return {
        success: true,
        phase: 1,
        executionTime,
        analysis: mergedAnalysis,
        gpt4Analysis,
        claude4Analysis
      };

    } catch (error) {
      console.error('❌ Phase 1 failed:', error.message);
      return {
        success: false,
        phase: 1,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  mergeAnalyses(gpt4Analysis, claude4Analysis) {
    // Extract key components from both analyses
    const gpt4Components = this.extractComponents(gpt4Analysis);
    const claude4Components = this.extractComponents(claude4Analysis);

    // Create a comprehensive merged analysis
    const mergedAnalysis = {
      problemSummary: this.mergeText(gpt4Components.summary, claude4Components.summary),
      categorization: this.mergeCategorization(gpt4Components.category, claude4Components.category),
      inputOutput: this.mergeInputOutput(gpt4Components.io, claude4Components.io),
      constraints: this.mergeConstraints(gpt4Components.constraints, claude4Components.constraints),
      difficulty: this.mergeDifficulty(gpt4Components.difficulty, claude4Components.difficulty),
      algorithmCategory: this.mergeAlgorithmCategory(gpt4Components.algorithm, claude4Components.algorithm),
      approaches: this.mergeApproaches(gpt4Components.approaches, claude4Components.approaches),
      confidence: this.calculateConfidence(gpt4Components, claude4Components)
    };

    return mergedAnalysis;
  }

  extractComponents(analysis) {
    // Extract structured components from the analysis text
    const components = {
      summary: '',
      category: '',
      io: { input: '', output: '' },
      constraints: [],
      difficulty: '',
      algorithm: '',
      approaches: [],
      confidence: 0.8
    };

    // Simple extraction logic - in a real implementation, you'd use more sophisticated parsing
    const lines = analysis.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('summary') || trimmed.toLowerCase().includes('problem')) {
        currentSection = 'summary';
      } else if (trimmed.toLowerCase().includes('category') || trimmed.toLowerCase().includes('type')) {
        currentSection = 'category';
      } else if (trimmed.toLowerCase().includes('input') || trimmed.toLowerCase().includes('output')) {
        currentSection = 'io';
      } else if (trimmed.toLowerCase().includes('constraint')) {
        currentSection = 'constraints';
      } else if (trimmed.toLowerCase().includes('difficulty')) {
        currentSection = 'difficulty';
      } else if (trimmed.toLowerCase().includes('algorithm')) {
        currentSection = 'algorithm';
      } else if (trimmed.toLowerCase().includes('approach')) {
        currentSection = 'approaches';
      }

      if (trimmed && !trimmed.startsWith('#')) {
        switch (currentSection) {
          case 'summary':
            components.summary += trimmed + ' ';
            break;
          case 'category':
            components.category = trimmed;
            break;
          case 'io':
            if (trimmed.toLowerCase().includes('input')) {
              components.io.input = trimmed;
            } else if (trimmed.toLowerCase().includes('output')) {
              components.io.output = trimmed;
            }
            break;
          case 'constraints':
            if (trimmed.includes('≤') || trimmed.includes('<') || trimmed.includes('>')) {
              components.constraints.push(trimmed);
            }
            break;
          case 'difficulty':
            if (trimmed.toLowerCase().includes('easy') || trimmed.toLowerCase().includes('medium') || 
                trimmed.toLowerCase().includes('hard') || trimmed.toLowerCase().includes('expert')) {
              components.difficulty = trimmed;
            }
            break;
          case 'algorithm':
            components.algorithm = trimmed;
            break;
          case 'approaches':
            if (trimmed.includes('.')) {
              components.approaches.push(trimmed);
            }
            break;
        }
      }
    }

    return components;
  }

  mergeText(text1, text2) {
    if (!text1) return text2;
    if (!text2) return text1;
    return `${text1.trim()} ${text2.trim()}`;
  }

  mergeCategorization(cat1, cat2) {
    if (!cat1) return cat2;
    if (!cat2) return cat1;
    return cat1 === cat2 ? cat1 : `${cat1} / ${cat2}`;
  }

  mergeInputOutput(io1, io2) {
    return {
      input: this.mergeText(io1.input, io2.input),
      output: this.mergeText(io1.output, io2.output)
    };
  }

  mergeConstraints(constraints1, constraints2) {
    const merged = [...new Set([...constraints1, ...constraints2])];
    return merged.filter(c => c.trim());
  }

  mergeDifficulty(diff1, diff2) {
    if (!diff1) return diff2;
    if (!diff2) return diff1;
    return diff1 === diff2 ? diff1 : `${diff1} (${diff2})`;
  }

  mergeAlgorithmCategory(algo1, algo2) {
    if (!algo1) return algo2;
    if (!algo2) return algo1;
    return algo1 === algo2 ? algo1 : `${algo1} / ${algo2}`;
  }

  mergeApproaches(approaches1, approaches2) {
    const merged = [...new Set([...approaches1, ...approaches2])];
    return merged.filter(a => a.trim());
  }

  calculateConfidence(components1, components2) {
    // Calculate confidence based on agreement between models
    let agreement = 0;
    let total = 0;

    if (components1.difficulty && components2.difficulty) {
      total++;
      if (components1.difficulty.toLowerCase() === components2.difficulty.toLowerCase()) {
        agreement++;
      }
    }

    if (components1.category && components2.category) {
      total++;
      if (components1.category.toLowerCase() === components2.category.toLowerCase()) {
        agreement++;
      }
    }

    if (components1.algorithm && components2.algorithm) {
      total++;
      if (components1.algorithm.toLowerCase() === components2.algorithm.toLowerCase()) {
        agreement++;
      }
    }

    return total > 0 ? agreement / total : 0.8;
  }
}

module.exports = Phase1Controller; 