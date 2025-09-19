// Test script to verify API configuration
// Run this in the browser console to test the adaptive learning API setup

async function testAPIConfig() {
  console.log('🧪 Testing Adaptive Learning API Configuration...');
  
  try {
    // Test the configuration
    const config = {
      baseUrl: 'https://api.a4f.co/v',
      apiKey: 'ddc-a4f-caee73746e914d3bb457fe535b7dd9a8',
      modelName: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.7,
      timeout: 30000
    };
    
    console.log('📋 API Configuration:', {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey.substring(0, 8) + '...',
      modelName: config.modelName
    });
    
    // Test API connection
    const testPrompt = {
      messages: [
        {
          role: "user",
          content: "Hello! This is a test message to verify the API connection is working. Please respond with 'API connection successful!'"
        }
      ],
      model: config.modelName,
      max_tokens: 100,
      temperature: 0.7
    };
    
    console.log('🔗 Testing API connection...');
    
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(testPrompt)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Successful!');
      console.log('📝 Response:', data.choices?.[0]?.message?.content || 'No content in response');
    } else {
      console.error('❌ API Connection Failed');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      const errorText = await response.text();
      console.error('Error Details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.testAPIConfig = testAPIConfig;
}

// Auto-run if this script is executed directly
if (typeof module === 'undefined') {
  testAPIConfig();
}

module.exports = { testAPIConfig };
