# 🚀 zeroTrace AI - Privacy-First AI Assistant

**Advanced AI-powered Chrome Extension with DSA Problem Solving & Multi-Modal Intelligence**

A Chrome extension that provides privacy-first AI assistance with context awareness, DSA problem solving, and multi-modal capabilities. Transform your browsing experience with intelligent AI that understands your context and helps you solve complex problems.

## ✨ Features

### 🎯 **DSA Problem Solver**
- **Optimal Solutions**: Get the most efficient algorithms for any DSA problem
- **Multi-Language Support**: C++, Python, Java, JavaScript with competitive programming templates
- **Complexity Analysis**: Detailed time and space complexity breakdown
- **Test Case Generation**: Comprehensive test cases for edge case coverage
- **Approach Explanation**: Step-by-step algorithm explanations

### 🧠 **AI Modes**
- **Chat**: General conversation with context awareness
- **Research**: Deep analysis with structured research capabilities
- **Code**: Programming assistance with code generation and debugging
- **Vision**: Image analysis and visual content understanding
- **DSA Solver**: Specialized for algorithmic problem solving
- **Gamification**: Track your progress and achievements

### 🔧 **Advanced Features**
- **Context Awareness**: Analyzes webpage content and selected text
- **Real-time Web Search**: Search the web for current information
- **Code Assistant**: Get help with programming, debugging, and explanations
- **Vision Analysis**: Analyze images and extract information
- **Privacy-First**: All processing in-memory with zero data storage

## 🚀 Quick Start

### 1. Install the Extension
```bash
# Clone the repository
git clone <repository-url>
cd futuregpt-main/futuregpt-main\ frontend

# Install dependencies
npm install

# Build the extension
npm run build
```

### 2. Start the Backend Server
```bash
# Navigate to backend directory
cd ../gpt-backend

# Install dependencies
npm install

# Start the server
node server.js
```

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from the frontend build

## 🎯 Usage Examples

### DSA Problem Solving
```
Problem: Maximum Subarray Sum
Description: Find the contiguous subarray with the largest sum
Difficulty: Medium
Language: C++

AI Response:
- Optimal solution using Kadane's Algorithm
- Time Complexity: O(n)
- Space Complexity: O(1)
- Complete code with edge case handling
- Test cases and explanations
```

### Context-Aware Chat
```
Input: "What's on this page?"
AI Response: Analyzes current webpage content and provides relevant insights
```

### Code Assistance
```
Input: "Help me debug this React component"
AI Response: Analyzes your code and provides debugging suggestions
```

### Vision Analysis
```
Input: Upload an image
AI Response: Extracts text, identifies objects, and analyzes visual content
```

## 🛠️ Backend API Endpoints

### Core Endpoints
- `POST /prompt` - General AI chat with context awareness
- `POST /solve-dsa` - DSA problem solving with optimal solutions
- `POST /analyze-complexity` - Algorithm complexity analysis
- `POST /generate-testcases` - Test case generation
- `POST /web-search` - Real-time web search
- `POST /function-call` - Function execution

### DSA Solver Features
```javascript
// Solve DSA problem
POST /solve-dsa
{
  "problem": {
    "title": "Maximum Subarray Sum",
    "description": "Find contiguous subarray with largest sum",
    "difficulty": "medium",
    "constraints": ["1 ≤ n ≤ 10^5", "1 ≤ arr[i] ≤ 10^9"]
  },
  "language": "cpp"
}

// Analyze complexity
POST /analyze-complexity
{
  "code": "your algorithm code",
  "language": "cpp"
}

// Generate test cases
POST /generate-testcases
{
  "problemDescription": "problem description",
  "count": 5
}
```

## 🎨 UI Components

### DSASolver Component
- **Problem Input**: Title, description, constraints, difficulty
- **Language Selection**: C++, Python, Java, JavaScript
- **Solution Display**: Code, complexity, approach, explanation
- **Test Cases**: Input/output pairs with descriptions
- **Complexity Analysis**: Time/space complexity breakdown

### Streamlined Sidebar
- **Mode Switching**: Chat, Research, Code, Vision, DSA Solver, Gamification
- **Quick Actions**: New chat, settings, mode-specific features

### Welcome Screen
- **Clean Interface**: General AI features and capabilities
- **Mode-specific Content**: Different features and examples for each mode

## 🔧 Configuration

### Environment Variables
```bash
# Backend configuration
OPENAI_API_KEY=your_openai_api_key
PORT=3000

# Frontend configuration
VITE_API_URL=http://localhost:3000
```

### Supported Programming Languages
- **C++**: STL, fast I/O, competitive programming templates
- **Python**: Built-in libraries, list comprehensions, efficient algorithms
- **Java**: Efficient data structures, StringBuilder for strings
- **JavaScript**: Modern ES6+ features, efficient array methods

## 🏆 DSA Problem Solving Features

### Algorithm Categories
- **Binary Search**: Variations and applications
- **Dynamic Programming**: 1D, 2D, state compression
- **Graph Algorithms**: DFS, BFS, Dijkstra, Floyd-Warshall
- **Tree Algorithms**: LCA, segment trees, binary lifting
- **String Algorithms**: KMP, Z-function, suffix arrays
- **Advanced Data Structures**: Trie, Segment Tree, Fenwick Tree
- **Greedy Algorithms**: Optimization strategies
- **Number Theory**: Combinatorics and mathematical algorithms

### Problem Difficulty Levels
- **Easy**: Basic algorithms and data structures
- **Medium**: Advanced algorithms and optimizations
- **Hard**: Complex algorithmic challenges
- **Expert**: Cutting-edge competitive programming problems

## 🔒 Privacy & Security

- **Privacy-First Design**: All processing in-memory
- **Zero Data Storage**: No persistent logging or tracking
- **Local Processing**: Sensitive data never leaves your device
- **Secure Communication**: Encrypted API calls to backend

## 🚀 Performance Features

### AI Model Integration
- **Multi-Model Pipeline**: GPT-4, Claude, Gemini, DeepSeek integration
- **Sequential Processing**: Multi-phase problem solving approach
- **Graceful Degradation**: Continues working even if some models fail
- **Error Handling**: Robust error handling with fallback solutions

### Real-time Features
- **Live Context Analysis**: Real-time webpage content analysis
- **Instant AI Responses**: Quick and accurate AI assistance
- **Multi-modal Support**: Text, code, and image processing
- **Context Awareness**: Understands your current browsing context

## 🎮 Gamification

- **Progress Tracking**: Monitor your AI usage and DSA solving progress
- **Achievements**: Unlock achievements for different activities
- **Streaks**: Track your daily activity streaks
- **Session Analytics**: View detailed session statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Multi-modal AI assistance
- [x] DSA problem solving
- [x] Context awareness
- [x] Privacy-first design

### Phase 2: Advanced Features 🚧
- [x] Multi-model AI pipeline
- [x] Gamification system
- [x] Error handling and fallbacks
- [ ] Advanced algorithm visualization

### Phase 3: Community Features 📋
- [ ] Problem sharing
- [ ] Solution comparison
- [ ] Collaborative solving
- [ ] Extension marketplace

---

**Transform your Chrome extension into a privacy-first AI assistant with powerful DSA solving capabilities!** 🚀 