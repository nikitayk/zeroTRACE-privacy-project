const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CodeSandbox {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'dsa-solver-sandbox');
    this.timeout = 10000; // 10 seconds timeout
    this.maxMemory = 256; // 256MB memory limit
  }

  // Initialize sandbox environment
  async initialize() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log('✅ Sandbox environment initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sandbox:', error);
      throw error;
    }
  }

  // Execute code in sandbox environment
  async executeCode(code, language, testInput) {
    console.log('🔄 Executing code in sandbox...');
    
    try {
      const fileName = `solution_${Date.now()}`;
      const filePath = path.join(this.tempDir, `${fileName}.${this.getFileExtension(language)}`);
      
      // Write code to file
      await fs.writeFile(filePath, code);
      
      // Execute based on language
      const result = await this.runCode(filePath, language, testInput);
      
      // Clean up
      await this.cleanup(filePath);
      
      return result;
    } catch (error) {
      console.error('❌ Sandbox execution failed:', error);
      throw error;
    }
  }

  // Run code with specific language compiler/interpreter
  async runCode(filePath, language, input) {
    const command = this.buildCommand(filePath, language);
    
    return new Promise((resolve, reject) => {
      const process = exec(command, {
        cwd: this.tempDir,
        timeout: this.timeout,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      process.stdout.on('data', (data) => {
        stdout += data;
      });

      process.stderr.on('data', (data) => {
        stderr += data;
      });

      process.on('close', (code) => {
        if (killed) {
          reject(new Error('Execution timeout'));
          return;
        }

        resolve({
          success: code === 0,
          output: stdout.trim(),
          error: stderr.trim(),
          exitCode: code,
          executionTime: Date.now() - process.startTime
        });
      });

      process.on('error', (error) => {
        reject(new Error(`Process error: ${error.message}`));
      });

      // Set start time
      process.startTime = Date.now();

      // Handle timeout
      setTimeout(() => {
        if (!process.killed) {
          killed = true;
          process.kill('SIGKILL');
        }
      }, this.timeout);

      // Provide input if available
      if (input && process.stdin) {
        process.stdin.write(input);
        process.stdin.end();
      }
    });
  }

  // Build execution command for different languages
  buildCommand(filePath, language) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    switch (language.toLowerCase()) {
      case 'cpp':
        return `g++ -std=c++17 -O2 -o "${fileName}" "${filePath}" && ./"${fileName}"`;
      
      case 'python':
        return `python3 "${filePath}"`;
      
      case 'java':
        return `javac "${filePath}" && java "${fileName}"`;
      
      case 'javascript':
        return `node "${filePath}"`;
      
      case 'c':
        return `gcc -O2 -o "${fileName}" "${filePath}" && ./"${fileName}"`;
      
      case 'python2':
        return `python2 "${filePath}"`;
      
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  // Get file extension for language
  getFileExtension(language) {
    const extensions = {
      'cpp': 'cpp',
      'c': 'c',
      'python': 'py',
      'python2': 'py',
      'java': 'java',
      'javascript': 'js',
      'js': 'js'
    };
    
    return extensions[language.toLowerCase()] || 'txt';
  }

  // Clean up temporary files
  async cleanup(filePath) {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const dir = path.dirname(filePath);
      
      // Remove source file
      await fs.unlink(filePath).catch(() => {});
      
      // Remove executable files
      const executableExtensions = ['', '.exe', '.out'];
      for (const ext of executableExtensions) {
        const execPath = path.join(dir, `${fileName}${ext}`);
        await fs.unlink(execPath).catch(() => {});
      }
      
      // Remove class files for Java
      if (path.extname(filePath) === '.java') {
        const classPath = path.join(dir, `${fileName}.class`);
        await fs.unlink(classPath).catch(() => {});
      }
      
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }

  // Validate code for security
  validateCode(code, language) {
    const securityChecks = {
      'cpp': [
        /system\s*\(/i,
        /exec\s*\(/i,
        /popen\s*\(/i,
        /fork\s*\(/i,
        /socket\s*\(/i,
        /network/i,
        /http/i,
        /curl/i
      ],
      'python': [
        /import\s+os/i,
        /import\s+subprocess/i,
        /import\s+sys/i,
        /eval\s*\(/i,
        /exec\s*\(/i,
        /__import__\s*\(/i,
        /open\s*\(/i,
        /file\s*\(/i
      ],
      'java': [
        /Runtime\.getRuntime\(\)/i,
        /ProcessBuilder/i,
        /System\.exec/i,
        /File\./i,
        /Network/i,
        /Socket/i
      ],
      'javascript': [
        /eval\s*\(/i,
        /Function\s*\(/i,
        /require\s*\(/i,
        /import\s*\(/i,
        /process\./i,
        /child_process/i,
        /fs\./i
      ]
    };

    const checks = securityChecks[language.toLowerCase()] || [];
    
    for (const check of checks) {
      if (check.test(code)) {
        throw new Error(`Security violation detected: ${check.source}`);
      }
    }

    return true;
  }

  // Test code with multiple inputs
  async testCode(code, language, testCases) {
    console.log(`🧪 Testing code with ${testCases.length} test cases...`);
    
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`  Testing case ${i + 1}/${testCases.length}...`);
      
      try {
        const result = await this.executeCode(code, language, testCase.input);
        
        results.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.output,
          success: result.success && this.compareOutput(result.output, testCase.output),
          error: result.error,
          executionTime: result.executionTime
        });
      } catch (error) {
        results.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          success: false,
          error: error.message,
          executionTime: 0
        });
      }
    }

    return {
      totalTests: testCases.length,
      passedTests: results.filter(r => r.success).length,
      failedTests: results.filter(r => !r.success).length,
      results: results,
      successRate: (results.filter(r => r.success).length / results.length) * 100
    };
  }

  // Compare output with expected output
  compareOutput(actual, expected) {
    if (!actual || !expected) return false;
    
    // Normalize outputs
    const normalize = (str) => {
      return str.trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/[^\w\s]/g, '');
    };
    
    const normalizedActual = normalize(actual);
    const normalizedExpected = normalize(expected);
    
    return normalizedActual === normalizedExpected;
  }

  // Get supported languages
  getSupportedLanguages() {
    return [
      { name: 'C++', extension: 'cpp', compiler: 'g++' },
      { name: 'C', extension: 'c', compiler: 'gcc' },
      { name: 'Python', extension: 'py', interpreter: 'python3' },
      { name: 'Java', extension: 'java', compiler: 'javac' },
      { name: 'JavaScript', extension: 'js', interpreter: 'node' }
    ];
  }

  // Check if language is supported
  isLanguageSupported(language) {
    const supported = this.getSupportedLanguages();
    return supported.some(lang => 
      lang.name.toLowerCase() === language.toLowerCase() ||
      lang.extension.toLowerCase() === language.toLowerCase()
    );
  }

  // Get system information
  async getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      tempDir: this.tempDir,
      supportedLanguages: this.getSupportedLanguages().map(lang => lang.name)
    };
  }
}

module.exports = CodeSandbox; 