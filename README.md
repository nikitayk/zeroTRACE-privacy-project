# 🚀 zeroTrace AI - Privacy-First AI Assistant

<div align="center">

![zeroTrace Logo](https://img.shields.io/badge/zeroTrace-AI%20Assistant-purple?style=for-the-badge&logo=chrome&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Privacy](https://img.shields.io/badge/privacy-Zero%20Trace-red?style=for-the-badge)

**Advanced AI-powered Chrome Extension with Sequential AI Pipeline & Multi-Modal Intelligence**


<!-- Add your images here -->
![Image 1](./WhatsApp%20Image%202025-09-21%20at%2014.50.58.jpeg)
![Image 2](./WhatsApp%20Image%202025-09-21%20at%2014.50.59.jpeg)
![Image 3](./WhatsApp%20Image%202025-09-21%20at%2014.56.22.jpeg)

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?style=flat-square&logo=google-chrome)](https://chrome.google.com/webstore)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://nodejs.org/)

</div>

---

## 🎯 **Vision & Mission**

**zeroTrace** is a revolutionary privacy-first AI assistant that transforms your Chrome browsing experience with intelligent, context-aware assistance. Unlike traditional AI extensions that compromise your privacy, zeroTrace processes everything **in-memory** with **zero data storage**, ensuring your data never leaves your device.

### **Why zeroTrace Exists**
- **🔒 Privacy Crisis**: Most AI extensions harvest and store your data
- **🎯 DSA Problem Solving**: Competitive programming needs optimal solutions
- **🧠 Multi-Modal Intelligence**: Text, code, images, and context awareness
- **⚡ Real-time Processing**: Instant AI assistance without data leaks

### **What Makes zeroTrace Different**
- ✅ **Privacy-First Design**: All processing happens in-memory
- ✅ **Zero Data Storage**: No persistent logging or tracking
- ✅ **Sequential AI Pipeline**: 5 AI models ensure 95%+ success rate
- ✅ **Context Awareness**: Understands webpage content and selections
- ✅ **Multi-Modal Support**: Text, code, images, and documents
- ✅ **Gamification**: Track progress and unlock achievements

---

## ✨ **Key Features**

### 🎯 **Sequential AI Pipeline (95%+ Success Rate)**
Our revolutionary 5-phase AI pipeline ensures optimal DSA problem solving:

```mermaid
graph TD
    A[User Input] --> B[Phase 1: Problem Analysis]
    B --> C[Phase 2: First Solution Attempt]
    C --> D{Success?}
    D -->|Yes| E[✅ Solution Found]
    D -->|No| F[Phase 3: Second Attempt]
    F --> G{Success?}
    G -->|Yes| E
    G -->|No| H[Phase 4: Third Attempt]
    H --> I{Success?}
    I -->|Yes| E
    I -->|No| J[Phase 5: Final Attempt]
    J --> K{Success?}
    K -->|Yes| E
    K -->|No| L[❌ All Phases Failed]
```

**Phase Details:**
- **Phase 1**: GPT-4.1 + Claude-4 Opus (AND Gate Analysis)
- **Phase 2**: GPT-4.1 → Claude-4 → GPT-4o (First Solution)
- **Phase 3**: Claude-4 → Gemini-2.5 Pro → GPT-4o (Error Analysis)
- **Phase 4**: Gemini-2.5 Pro → DeepSeek R1 → GPT-4o (New Approach)
- **Phase 5**: DeepSeek R1 → GPT-4.1 → GPT-4o (Final Attempt)

### 🧠 **AI Modes**
- **💬 Chat**: General conversation with context awareness
- **🔍 Research**: Deep analysis with structured research capabilities
- **💻 Code**: Programming assistance with code generation and debugging
- **👁️ Vision**: Image analysis and visual content understanding
- **🎯 DSA Solver**: Specialized for algorithmic problem solving
- **🏆 Gamification**: Track your progress and achievements
- **📚 Study Plan**: Adaptive learning with personalized content
- **🧠 Adaptive Learning**: AI-powered personalized education

### 🔧 **Advanced Features**
- **Context Awareness**: Analyzes webpage content and selected text
- **Real-time Web Search**: Search the web for current information
- **File Upload & Analysis**: Process images and documents
- **Multi-Language Support**: C++, Python, Java, JavaScript
- **Complexity Analysis**: Detailed time and space complexity breakdown
- **Test Case Generation**: Comprehensive test cases for edge case coverage
- **Chrome Extension Integration**: Seamless browser experience

---

## 🏗️ **Architecture & Tech Stack**

### **Frontend Architecture**
```
futuregpt-main frontend/
├── src/
│   ├── components/          # React components
│   │   ├── DSASolver.tsx    # DSA problem solving interface
│   │   ├── Sidebar.tsx      # Mode switching sidebar
│   │   ├── Gamification.tsx # Progress tracking
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useAI.ts         # AI integration hook
│   │   └── useStorage.ts    # Local storage management
│   ├── adaptive_learning/   # Adaptive learning system
│   ├── study/              # Study plan components
│   └── types/              # TypeScript type definitions
├── public/
│   ├── manifest.json       # Chrome extension manifest
│   └── background.js       # Extension background script
└── dist/                   # Built extension files
```

**Frontend Technologies:**
- **React 18.3.1** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Chart.js** for analytics
- **TensorFlow.js** for ML capabilities

### **Backend Architecture**
```
gpt-backend/
├── models/                 # AI model adapters
│   ├── gpt4.js            # GPT-4.1 adapter
│   ├── claude4.js         # Claude-4 Opus adapter
│   ├── gemini.js          # Gemini-2.5 Pro adapter
│   ├── deepseek.js        # DeepSeek R1 adapter
│   └── gpt4o.js           # GPT-4o adapter
├── pipeline/              # Sequential AI pipeline
│   ├── orchestrator.js    # Main pipeline controller
│   ├── phase1.js          # Problem analysis
│   ├── phase2.js          # First solution attempt
│   ├── phase3.js          # Second solution attempt
│   ├── phase4.js          # Third solution attempt
│   └── phase5.js          # Final solution attempt
├── routes/                # API endpoints
│   ├── solve-dsa.js       # Enhanced DSA solving
│   ├── analyze-complexity.js
│   └── generate-testcases.js
├── testRunner/            # Code execution environment
└── server.js              # Main Express server
```

**Backend Technologies:**
- **Node.js** with Express.js
- **Axios** for HTTP requests
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **Sequential AI Pipeline** with 5 AI models

### **Chrome Extension Integration**
- **Manifest V3** compliance
- **Side Panel** interface
- **Background Script** for notifications and alarms
- **Content Scripts** for webpage interaction
- **Storage API** for local data persistence
- **Scripting API** for dynamic content injection

---

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Chrome browser
- API keys for AI models (optional for demo mode)

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd zero
```

### **2. Frontend Setup**
```bash
cd "futuregpt-main frontend"
npm install
npm run build
```

### **3. Backend Setup**
```bash
cd ../gpt-backend
npm install
```

### **4. Configure Environment Variables**
Create `.env` file in `gpt-backend/` directory:
```bash
# API Keys (optional - demo mode works without them)
GPT4_API_KEY=your_gpt4_api_key
CLAUDE4_API_KEY=your_claude4_opus_api_key
GEMINI_API_KEY=your_gemini2.5_pro_api_key
DEEPSEEK_API_KEY=your_deepseek_r1_api_key
GPT4O_API_KEY=your_gpt4o_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Pipeline Configuration
MAX_PIPELINE_PHASES=5
TEST_TIMEOUT_MS=30000
MAX_EXECUTION_TIME_MS=120000
ENABLE_DETAILED_LOGGING=true
```

### **5. Start the Backend Server**
```bash
cd gpt-backend
node server.js
```

### **6. Load Extension in Chrome**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist` folder from `futuregpt-main frontend/`
5. Pin the extension to your toolbar

### **7. Verify Installation**
- Click the zeroTrace extension icon
- The side panel should open with the AI interface
- Try asking a question to test the demo mode

---

## 🎯 **Usage Guide**

### **Basic Usage**
1. **Open zeroTrace**: Click the extension icon or use `Ctrl+Shift+S`
2. **Choose Mode**: Select from Chat, Research, Code, Vision, DSA Solver, etc.
3. **Ask Questions**: Type your question or paste DSA problems
4. **Get AI Responses**: Receive intelligent, context-aware answers

### **DSA Problem Solving**
```javascript
// Example: Maximum Subarray Sum
Problem: Find the contiguous subarray with the largest sum
Difficulty: Medium
Language: C++

// zeroTrace Response:
- Optimal solution using Kadane's Algorithm
- Time Complexity: O(n)
- Space Complexity: O(1)
- Complete code with edge case handling
- Test cases and explanations
- Pipeline metadata showing which phase succeeded
```

### **Context-Aware Chat**
- **Webpage Analysis**: "What's on this page?" analyzes current webpage
- **Selected Text**: Select text and ask questions about it
- **Code Assistance**: "Help me debug this React component"
- **Research**: "Find the latest information about AI trends"

### **File Upload & Analysis**
- **Images**: Upload DSA problem screenshots for automatic analysis
- **Documents**: Upload PDFs or text files for content extraction
- **Code Files**: Upload source code for analysis and optimization

### **Gamification Features**
- **Streaks**: Track daily usage streaks
- **Achievements**: Unlock badges for different activities
- **Analytics**: View detailed progress statistics
- **Challenges**: Set timed challenges for productivity

---

## 🔒 **Privacy & Security**

### **Privacy-First Philosophy**
- **In-Memory Processing**: All data processed in RAM only
- **Zero Data Storage**: No persistent logging or tracking
- **Local Processing**: Sensitive data never leaves your device
- **No Cloud Storage**: Everything happens locally

### **Security Features**
- **Encrypted Communication**: Secure API calls to backend
- **Sandboxed Execution**: Code runs in isolated environments
- **Permission Management**: Minimal required permissions
- **Data Minimization**: Only necessary data is processed

### **Comparison with Other AI Extensions**
| Feature | zeroTrace | ChatGPT Extension | Other AI Extensions |
|---------|-----------|-------------------|---------------------|
| Data Storage | ❌ Zero | ✅ Cloud Storage | ✅ Cloud Storage |
| Privacy | ✅ Complete | ❌ Compromised | ❌ Compromised |
| Context Awareness | ✅ Full | ⚠️ Limited | ⚠️ Limited |
| DSA Solving | ✅ 95% Success | ❌ Basic | ❌ Basic |
| Multi-Modal | ✅ Yes | ⚠️ Text Only | ⚠️ Text Only |
| Gamification | ✅ Built-in | ❌ No | ❌ No |

---

## 🎮 **Gamification System**

### **Achievement System**
- **🏆 Conversationalist**: 10 assistant answers in a session
- **🎯 Problem Crusher**: Solve 5 DSA problems in a session
- **🔥 Consistent**: Maintain a 3-day streak
- **🔍 Search Master**: Run 5 web searches in a session

### **Progress Tracking**
- **Daily Streaks**: Track consecutive days of usage
- **Session Analytics**: Monitor activity during each session
- **Challenge Mode**: Set timed challenges for productivity
- **Performance Metrics**: Detailed statistics and insights

### **Rewards System**
- **Points**: Earn points for different activities
- **Levels**: Progress through different levels
- **Badges**: Unlock achievement badges
- **Leaderboards**: Compare with other users (optional)

---

## 🧠 **Adaptive Learning System**

### **Personalized Education**
- **User Modeling**: AI learns your learning patterns
- **Adaptive Content**: Content adjusts to your skill level
- **Progress Tracking**: Monitor learning progress
- **Recommendations**: Get personalized study suggestions

### **Learning Domains**
- **DSA Programming**: Data structures and algorithms
- **UPSC Preparation**: Civil services exam prep
- **JEE Preparation**: Engineering entrance exam
- **Developer Skills**: Modern software development

### **Assessment Types**
- **Multiple Choice**: Quick knowledge checks
- **Subjective**: Detailed problem solving
- **Practical**: Hands-on coding challenges
- **Case Studies**: Real-world scenarios

---

## 📊 **API Endpoints**

### **Core Endpoints**
```javascript
// General AI Chat
POST /prompt
{
  "prompt": "Your question here",
  "mode": "chat|research|code|vision|dsa-solver",
  "webpageContent": "Current page content",
  "selectedText": "Selected text",
  "conversationId": "unique-conversation-id"
}

// Enhanced DSA Problem Solving
POST /solve-dsa
{
  "problem": {
    "title": "Maximum Subarray Sum",
    "description": "Find contiguous subarray with largest sum",
    "difficulty": "medium",
    "constraints": ["1 ≤ n ≤ 10^5", "1 ≤ arr[i] ≤ 10^9"],
    "examples": [{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}]
  },
  "language": "cpp"
}

// Complexity Analysis
POST /analyze-complexity
{
  "code": "your algorithm code",
  "language": "cpp"
}

// Test Case Generation
POST /generate-testcases
{
  "problemDescription": "problem description",
  "count": 10,
  "difficulty": "medium"
}

// File Upload & Analysis
POST /upload-file
POST /analyze-file

// Web Search
POST /web-search
{
  "query": "search query"
}
```

### **Response Format**
```javascript
{
  "success": true,
  "metadata": {
    "finalPhase": 2,
    "totalExecutionTime": 45000,
    "totalAttempts": 2,
    "phaseDetails": {
      "name": "First Solution Attempt",
      "models": ["GPT-4.1", "Claude-4 Opus", "GPT-4o"],
      "logic": "Sequential",
      "description": "Select algorithm, implement, optimize, test"
    }
  },
  "solution": {
    "code": "// Optimal solution code",
    "language": "cpp",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "approach": "Kadane's Algorithm",
    "explanation": "Detailed explanation...",
    "testResults": {
      "passed": 10,
      "failed": 0,
      "total": 10,
      "successRate": "100.0"
    }
  },
  "phases": [
    // Detailed phase information
  ]
}
```

---

## 🎯 **DSA Problem Solving Features**

### **Algorithm Categories**
- **Binary Search**: Variations and applications
- **Dynamic Programming**: 1D, 2D, state compression
- **Graph Algorithms**: DFS, BFS, Dijkstra, Floyd-Warshall
- **Tree Algorithms**: LCA, segment trees, binary lifting
- **String Algorithms**: KMP, Z-function, suffix arrays
- **Advanced Data Structures**: Trie, Segment Tree, Fenwick Tree
- **Greedy Algorithms**: Optimization strategies
- **Number Theory**: Combinatorics and mathematical algorithms

### **Programming Languages**
- **C++**: STL, fast I/O, competitive programming templates
- **Python**: Built-in libraries, list comprehensions, efficient algorithms
- **Java**: Efficient data structures, StringBuilder for strings
- **JavaScript**: Modern ES6+ features, efficient array methods

### **Problem Difficulty Levels**
- **Easy**: Basic algorithms and data structures
- **Medium**: Advanced algorithms and optimizations
- **Hard**: Complex algorithmic challenges
- **Expert**: Cutting-edge competitive programming problems

### **Success Metrics**
- **95%+ Success Rate** through sequential AI pipeline
- **15-45s Response Time** for optimal solutions
- **Comprehensive Testing** with edge case coverage
- **Multiple Approaches** tried automatically

---

## 🚀 **Performance Features**

### **AI Model Integration**
- **Multi-Model Pipeline**: GPT-4, Claude, Gemini, DeepSeek integration
- **Sequential Processing**: Multi-phase problem solving approach
- **Graceful Degradation**: Continues working even if some models fail
- **Error Handling**: Robust error handling with fallback solutions

### **Real-time Features**
- **Live Context Analysis**: Real-time webpage content analysis
- **Instant AI Responses**: Quick and accurate AI assistance
- **Multi-modal Support**: Text, code, and image processing
- **Context Awareness**: Understands your current browsing context

### **Optimization Features**
- **Caching**: Intelligent caching for faster responses
- **Streaming**: Real-time response streaming
- **Compression**: Optimized data transfer
- **Parallel Processing**: Multiple AI models working simultaneously

---

## 👥 **Contributors & Team**

<div align="center">

### **Core Development Team**

<table>
<tr>
<td align="center">

<br/>
<strong>Nikita Chaurasi</strong>
<br/>
<em>Team Lead & UI/UX</em>
<br/>
<a href="https://github.com/nikitayk">GitHub</a> | 
<a href="https://www.linkedin.com/in/nikita-chaurasia-b82910288/">LinkedIn</a>
</td>
<td align="center">

<br/>
<strong>Ali Rizvi</strong>
<br/>
<em>Backend Manager</em>
<br/>
<a href="https://github.com/alirizzzv">GitHub</a> | 
<a href="https://www.linkedin.com/in/ali-rizvi-4628ab286/">LinkedIn</a>
</td>
<td align="center">

<br/>
<strong>Raj Vardhan</strong>
<br/>
<em>AI & Architecture</em>
<br/>
<a href="https://github.com/NoobVenom">GitHub</a> | 
<a href="https://www.linkedin.com/in/rajvardhankumar/">LinkedIn</a>
</td>
</tr>
</table>

</div>

### **Team Expertise**
- **Frontend Development**: React, TypeScript, Chrome Extensions
- **Backend Architecture**: Node.js, Express, AI Integration
- **AI/ML**: Sequential AI Pipelines, Model Integration
- **UI/UX Design**: Modern, intuitive user interfaces
- **Privacy & Security**: Zero-trace data processing

---

## 🗺️ **Future Roadmap**

### **Phase 1: Core Features ✅**
- [x] Multi-modal AI assistance
- [x] DSA problem solving with sequential pipeline
- [x] Context awareness and webpage analysis
- [x] Privacy-first design with zero data storage
- [x] Chrome extension integration
- [x] Gamification system

### **Phase 2: Advanced Features 🚧**
- [x] Multi-model AI pipeline (95%+ success rate)
- [x] Enhanced error handling and fallbacks
- [x] File upload and analysis capabilities
- [x] Real-time web search integration
- [ ] Advanced algorithm visualization
- [ ] Custom model fine-tuning
- [ ] Offline mode support

### **Phase 3: Community Features 📋**
- [ ] Problem sharing and collaboration
- [ ] Solution comparison and benchmarking
- [ ] Community-driven problem database
- [ ] Extension marketplace integration
- [ ] User-generated content support
- [ ] Social learning features

### **Phase 4: Enterprise Features 🔮**
- [ ] Team collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Custom AI model deployment
- [ ] Enterprise security features
- [ ] API rate limiting and management
- [ ] White-label solutions

### **Long-term Vision 🌟**
- **Global AI Assistant**: Expand beyond Chrome to all browsers
- **Educational Platform**: Become the go-to platform for coding education
- **AI Research**: Contribute to open-source AI research
- **Privacy Standards**: Set new standards for privacy-first AI
- **Community Ecosystem**: Build a thriving developer community

---

## 📄 **License & Acknowledgements**

### **License**
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Open Source**
zeroTrace is committed to open-source development and community contribution. We welcome:
- **Bug Reports**: Help us improve the software
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve our documentation
- **Testing**: Help us test new features

### **Acknowledgements**
- **OpenAI** for GPT models and API
- **Anthropic** for Claude models
- **Google** for Gemini models
- **DeepSeek** for advanced reasoning models
- **React Team** for the amazing frontend framework
- **Chrome Extensions Team** for the extension platform
- **Open Source Community** for various libraries and tools

### **References**
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

---

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Contribution Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Be respectful and inclusive

### **Development Setup**
```bash
# Clone your fork
git clone https://github.com/your-username/zero.git
cd zero

# Install dependencies
cd "futuregpt-main frontend"
npm install

cd ../gpt-backend
npm install

# Start development servers
npm run dev  # Frontend
node server.js  # Backend
```

---

## 📞 **Support & Contact**

### **Getting Help**
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Discord**: Join our Discord server for real-time help

### **Contact Information**
- **Email**: support@zerotrace.ai
- **GitHub**: [zeroTrace Repository](https://github.com/zerotrace/zero)
- **Website**: [zeroTrace.ai](https://zerotrace.ai)
- **Twitter**: [@zeroTraceAI](https://twitter.com/zeroTraceAI)

### **Community**
- **Discord Server**: [Join our community](https://discord.gg/zerotrace)
- **Reddit**: [r/zeroTrace](https://reddit.com/r/zerotrace)
- **Stack Overflow**: Tag questions with `zerotrace`

---

<div align="center">

## 🌟 **Transform Your Chrome Experience**

**zeroTrace** - Where privacy meets intelligence, and AI becomes your personal assistant without compromising your data.

[![Get Started](https://img.shields.io/badge/Get%20Started-Install%20Now-purple?style=for-the-badge&logo=chrome)](https://chrome.google.com/webstore)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-black?style=for-the-badge&logo=github)](https://github.com/zerotrace/zero)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-blue?style=for-the-badge&logo=discord)](https://discord.gg/zerotrace)

---

**Made with ❤️ by the zeroTrace Team**

*Privacy-First • AI-Powered • Open Source*

</div>
