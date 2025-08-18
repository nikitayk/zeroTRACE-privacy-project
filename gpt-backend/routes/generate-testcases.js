const express = require('express');
const GPT4oAdapter = require('../models/gpt4o');

const router = express.Router();

// Initialize GPT-4o for test case generation
const initializeGenerator = () => {
  const gpt4oApiKey = process.env.GPT4O_API_KEY || 'sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6';
  return new GPT4oAdapter(gpt4oApiKey);
};

// Enhanced test case generation endpoint
router.post('/generate-testcases', async (req, res) => {
  const { problemDescription, count = 10, difficulty = 'medium' } = req.body;

  if (!problemDescription) {
    return res.status(400).json({ 
      error: 'Invalid problem description provided',
      details: 'Problem description is required'
    });
  }

  console.log('🧪 Enhanced Test Case Generation Request');
  console.log(`📝 Problem: ${problemDescription.substring(0, 100)}...`);
  console.log(`🔢 Count: ${count}`);
  console.log(`📊 Difficulty: ${difficulty}`);

  try {
    const generator = initializeGenerator();
    
    // Create comprehensive test case generation prompt
    const generationPrompt = `Generate ${count} comprehensive test cases for this problem:

Problem Description:
${problemDescription}

Difficulty Level: ${difficulty}

Requirements:
1. Normal cases (typical inputs)
2. Edge cases (empty input, single element, etc.)
3. Boundary conditions (maximum/minimum values)
4. Stress test cases (large inputs)
5. Corner cases (unusual but valid inputs)
6. Error cases (invalid inputs where applicable)

For each test case provide:
- Input format (exactly as expected)
- Expected output (exactly as expected)
- Brief description of what it tests
- Category (normal/edge/boundary/stress/corner/error)

Make test cases realistic and challenging for ${difficulty} difficulty level.`;

    const testCases = await generator.generateTestCases(problemDescription, count);
    
    // Parse the generated test cases
    const parsedTestCases = parseTestCases(testCases);
    
    // Categorize test cases
    const categorizedTestCases = categorizeTestCases(parsedTestCases);
    
    console.log('✅ Test case generation completed');

    res.json({
      success: true,
      testCases: parsedTestCases,
      categorized: categorizedTestCases,
      metadata: {
        totalCount: parsedTestCases.length,
        difficulty: difficulty,
        generationTime: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Test case generation failed:', error);
    res.status(500).json({ 
      error: 'Test case generation failed',
      details: error.message,
      success: false
    });
  }
});

// Parse test cases from AI response
function parseTestCases(response) {
  const testCases = [];
  const lines = response.split('\n');
  let currentTestCase = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().includes('test case') || trimmed.toLowerCase().includes('input:')) {
      if (currentTestCase) {
        testCases.push(currentTestCase);
      }
      currentTestCase = { 
        input: '', 
        output: '', 
        description: '',
        category: 'normal'
      };
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
    } else if (trimmed.toLowerCase().includes('category:') && currentTestCase) {
      const catMatch = trimmed.match(/category:\s*(.+)/i);
      if (catMatch) {
        currentTestCase.category = catMatch[1].trim().toLowerCase();
      }
    }
  }

  if (currentTestCase) {
    testCases.push(currentTestCase);
  }

  return testCases.length > 0 ? testCases : getDefaultTestCases();
}

// Categorize test cases by type
function categorizeTestCases(testCases) {
  const categories = {
    normal: [],
    edge: [],
    boundary: [],
    stress: [],
    corner: [],
    error: []
  };

  testCases.forEach(testCase => {
    const category = testCase.category || 'normal';
    if (categories[category]) {
      categories[category].push(testCase);
    } else {
      categories.normal.push(testCase);
    }
  });

  return categories;
}

// Get default test cases for fallback
function getDefaultTestCases() {
  return [
    {
      input: '[1, 2, 3, 4, 5]',
      output: '15',
      description: 'Basic positive numbers',
      category: 'normal'
    },
    {
      input: '[-1, -2, -3]',
      output: '-1',
      description: 'All negative numbers',
      category: 'edge'
    },
    {
      input: '[0]',
      output: '0',
      description: 'Single element',
      category: 'edge'
    },
    {
      input: '[]',
      output: '0',
      description: 'Empty array',
      category: 'edge'
    },
    {
      input: '[1, -2, 3, -4, 5]',
      output: '5',
      description: 'Mixed positive and negative',
      category: 'normal'
    },
    {
      input: '[1000000, 2000000, 3000000]',
      output: '6000000',
      description: 'Large numbers',
      category: 'stress'
    },
    {
      input: '[1, 1, 1, 1, 1]',
      output: '5',
      description: 'All same values',
      category: 'corner'
    },
    {
      input: '[0, 0, 0, 0, 0]',
      output: '0',
      description: 'All zeros',
      category: 'corner'
    },
    {
      input: '[1]',
      output: '1',
      description: 'Single positive element',
      category: 'edge'
    },
    {
      input: '[-1]',
      output: '-1',
      description: 'Single negative element',
      category: 'edge'
    }
  ];
}

// Get test case statistics
function getTestStatistics(testCases) {
  const categories = categorizeTestCases(testCases);
  
  return {
    total: testCases.length,
    byCategory: Object.keys(categories).reduce((acc, category) => {
      acc[category] = categories[category].length;
      return acc;
    }, {}),
    coverage: {
      normal: categories.normal.length,
      edge: categories.edge.length,
      boundary: categories.boundary.length,
      stress: categories.stress.length,
      corner: categories.corner.length,
      error: categories.error.length
    }
  };
}

module.exports = router; 