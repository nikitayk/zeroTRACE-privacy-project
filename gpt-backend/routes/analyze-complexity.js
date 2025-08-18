const express = require('express');
const GPT4oAdapter = require('../models/gpt4o');

const router = express.Router();

// Initialize GPT-4o for complexity analysis
const initializeAnalyzer = () => {
  const gpt4oApiKey = process.env.GPT4O_API_KEY || 'sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6';
  return new GPT4oAdapter(gpt4oApiKey);
};

// Enhanced complexity analysis endpoint
router.post('/analyze-complexity', async (req, res) => {
  const { code, language = 'cpp' } = req.body;

  if (!code) {
    return res.status(400).json({ 
      error: 'Invalid code provided',
      details: 'Code field is required'
    });
  }

  console.log('🔍 Enhanced Complexity Analysis Request');
  console.log(`🔧 Language: ${language}`);
  console.log(`📝 Code length: ${code.length} characters`);

  try {
    const analyzer = initializeAnalyzer();
    
    // Create comprehensive analysis prompt
    const analysisPrompt = `Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide detailed analysis including:
1. Time complexity with mathematical explanation
2. Space complexity with memory usage breakdown
3. Algorithm identification and classification
4. Performance characteristics
5. Potential optimizations
6. Edge cases and their impact
7. Best and worst case scenarios
8. Practical considerations for competitive programming

Be precise and mathematical in your analysis.`;

    const analysis = await analyzer.callAPI([
      {
        role: 'system',
        content: 'You are an expert algorithm complexity analyst specializing in competitive programming. Provide detailed, mathematical analysis of time and space complexity.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ], 0.1, 2000);

    // Parse the analysis response
    const parsedAnalysis = parseComplexityAnalysis(analysis);
    
    console.log('✅ Complexity analysis completed');

    res.json({
      success: true,
      analysis: parsedAnalysis,
      metadata: {
        language: language,
        codeLength: code.length,
        analysisTime: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Complexity analysis failed:', error);
    res.status(500).json({ 
      error: 'Complexity analysis failed',
      details: error.message,
      success: false
    });
  }
});

// Parse complexity analysis from AI response
function parseComplexityAnalysis(response) {
  const analysis = {
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    algorithm: 'Unknown',
    explanation: '',
    optimizations: [],
    edgeCases: [],
    bestCase: '',
    worstCase: '',
    practicalNotes: ''
  };

  const lines = response.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().includes('time complexity:')) {
      currentSection = 'timeComplexity';
      const match = trimmed.match(/time complexity:\s*(.+)/i);
      if (match) {
        analysis.timeComplexity = match[1].trim();
      }
    } else if (trimmed.toLowerCase().includes('space complexity:')) {
      currentSection = 'spaceComplexity';
      const match = trimmed.match(/space complexity:\s*(.+)/i);
      if (match) {
        analysis.spaceComplexity = match[1].trim();
      }
    } else if (trimmed.toLowerCase().includes('algorithm:')) {
      currentSection = 'algorithm';
      const match = trimmed.match(/algorithm:\s*(.+)/i);
      if (match) {
        analysis.algorithm = match[1].trim();
      }
    } else if (trimmed.toLowerCase().includes('explanation:')) {
      currentSection = 'explanation';
    } else if (trimmed.toLowerCase().includes('optimization:')) {
      currentSection = 'optimizations';
    } else if (trimmed.toLowerCase().includes('edge case')) {
      currentSection = 'edgeCases';
    } else if (trimmed.toLowerCase().includes('best case:')) {
      currentSection = 'bestCase';
      const match = trimmed.match(/best case:\s*(.+)/i);
      if (match) {
        analysis.bestCase = match[1].trim();
      }
    } else if (trimmed.toLowerCase().includes('worst case:')) {
      currentSection = 'worstCase';
      const match = trimmed.match(/worst case:\s*(.+)/i);
      if (match) {
        analysis.worstCase = match[1].trim();
      }
    } else if (trimmed && currentSection) {
      switch (currentSection) {
        case 'explanation':
          analysis.explanation += trimmed + ' ';
          break;
        case 'optimizations':
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            analysis.optimizations.push(trimmed.substring(1).trim());
          }
          break;
        case 'edgeCases':
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            analysis.edgeCases.push(trimmed.substring(1).trim());
          }
          break;
        case 'practicalNotes':
          analysis.practicalNotes += trimmed + ' ';
          break;
      }
    }
  }

  // Clean up explanations
  analysis.explanation = analysis.explanation.trim();
  analysis.practicalNotes = analysis.practicalNotes.trim();

  return analysis;
}

module.exports = router; 