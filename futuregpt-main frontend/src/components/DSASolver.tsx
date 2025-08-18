import { useState } from 'react';
import { Code, Zap, Clock, Play, FileText, Target } from 'lucide-react';
import type { DSAProblem, DSASolution, TestCase, ProgrammingLanguage, UploadedFile, ImageAnalysis, DocumentAnalysis, Context } from '../types';

interface DSASolverProps {
  onSolve: (problem: DSAProblem, language: string) => Promise<DSASolution>;
  onAnalyzeComplexity: (code: string, language: string) => Promise<any>;
  onGenerateTestCases: (description: string, count: number) => Promise<TestCase[]>;
  onFileUpload?: (file: UploadedFile) => Promise<void>;
  onFileAnalysis?: (file: UploadedFile) => Promise<ImageAnalysis | DocumentAnalysis>;
  isLoading: boolean;
  pageContext?: Context;
  onPullContext?: () => Promise<Context>;
  onCaptureActiveImage?: () => Promise<Blob | null>;
}

const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    name: 'C++',
    extension: '.cpp',
    syntax: 'cpp',
    features: ['STL', 'Fast execution', 'Competitive programming standard']
  },
  {
    name: 'Python',
    extension: '.py',
    syntax: 'python',
    features: ['Readable code', 'Built-in libraries', 'Quick prototyping']
  },
  {
    name: 'Java',
    extension: '.java',
    syntax: 'java',
    features: ['Object-oriented', 'Platform independent', 'Enterprise ready']
  },
  {
    name: 'JavaScript',
    extension: '.js',
    syntax: 'javascript',
    features: ['Web development', 'Dynamic typing', 'Rich ecosystem']
  }
];

export function DSASolver({ onSolve, onAnalyzeComplexity, onGenerateTestCases, onFileUpload, onFileAnalysis, isLoading, pageContext, onPullContext, onCaptureActiveImage }: DSASolverProps) {
  const [problemText, setProblemText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [solution, setSolution] = useState<DSASolution | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<any>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const inferTitle = (text: string) => {
    const firstLine = text.split('\n').map(s => s.trim()).find(Boolean) || 'DSA Problem';
    return firstLine.length > 80 ? firstLine.slice(0, 80) + '…' : firstLine;
  };

  const handleSolve = async () => {
    if (!problemText.trim()) return;

    const problem: DSAProblem = {
      id: Date.now().toString(),
      title: inferTitle(problemText),
      description: problemText,
      difficulty,
      category: 'competitive-programming',
      tags: [],
      constraints: [],
      examples: testCases
    };

    try {
      const result = await onSolve(problem, selectedLanguage);
      setSolution(result);
    } catch (error) {
      console.error('Error solving problem:', error);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (!solution?.code) return;

    try {
      const analysis = await onAnalyzeComplexity(solution.code, selectedLanguage);
      setComplexityAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
    }
  };

  const handleGenerateTestCases = async () => {
    if (!problemText.trim()) return;

    try {
      const cases = await onGenerateTestCases(problemText, 5);
      setTestCases(cases);
    } catch (error) {
      console.error('Error generating test cases:', error);
    }
  };

  const pullFromActiveTab = async () => {
    try {
      const ctx = onPullContext ? await onPullContext() : pageContext;
      const fromSelection = ctx?.selectedText?.trim();
      const fromPage = ctx?.webpageContent?.trim();
      const text = fromSelection || fromPage || '';
      if (text) setProblemText(text);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 text-blue-400">
        <Target className="w-5 h-5" />
        <h2 className="text-lg font-semibold">DSA Problem Solver</h2>
      </div>

      {/* Single Problem Box */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Problem (paste everything here)</label>
          <button
            onClick={pullFromActiveTab}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
            disabled={isLoading}
          >
            Use Active Tab
          </button>
          <button
            onClick={async () => {
              if (!onCaptureActiveImage || !onFileAnalysis) return;
              setIsProcessingImage(true);
              try {
                const blob = await onCaptureActiveImage();
                if (!blob) return;
                const file: UploadedFile = {
                  id: Date.now().toString(),
                  name: 'active-tab.png',
                  type: blob.type || 'image/png',
                  size: blob.size,
                  content: await blob.arrayBuffer()
                };
                if (onFileUpload) await onFileUpload(file);
                const a = await onFileAnalysis(file);
                let built = '';
                if ('extractedText' in a && a.extractedText) built += a.extractedText + '\n\n';
                if ('text' in a && Array.isArray((a as any).text)) built += (a as any).text.join(' ') + '\n\n';
                if (a.problemStatement) built += `Problem: ${a.problemStatement}\n`;
                if (a.inputFormat) built += `Input Format: ${a.inputFormat}\n`;
                if (a.outputFormat) built += `Output Format: ${a.outputFormat}\n`;
                if (a.constraints?.length) built += `Constraints: ${a.constraints.join(', ')}\n`;
                if ((a as any).sampleInput) built += `Sample Input: ${(a as any).sampleInput}\n`;
                if ((a as any).sampleOutput) built += `Sample Output: ${(a as any).sampleOutput}\n`;
                if ((a as any).explanation) built += `Explanation: ${(a as any).explanation}\n`;
                setProblemText(prev => (prev?.trim() ? prev + '\n\n' + built : built));
                
                // Auto-solve the problem after image analysis
                setTimeout(() => {
                  handleSolve();
                }, 500);
              } catch (error) {
                console.error('Error processing active image:', error);
              } finally {
                setIsProcessingImage(false);
              }
            }}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
            disabled={isLoading || isProcessingImage}
          >
            Use Active Image & Solve
          </button>
        </div>
        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder={"Paste the full DSA problem, including constraints, input/output, samples, etc."}
          rows={8}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROGRAMMING_LANGUAGES.map(lang => (
                <option key={lang.name} value={lang.syntax}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSolve}
          disabled={isLoading || !problemText.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          <span>Solve Problem</span>
        </button>

        <button
          onClick={handleGenerateTestCases}
          disabled={isLoading || !problemText.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Generate Tests</span>
        </button>
      </div>

      {/* Test Cases */}
      {testCases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-300 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Test Cases</span>
          </h3>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Test Case {index + 1}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-400">Input:</span>
                    <div className="font-mono bg-gray-900 p-2 rounded mt-1">{testCase.input}</div>
                  </div>
                  <div>
                    <span className="text-blue-400">Output:</span>
                    <div className="font-mono bg-gray-900 p-2 rounded mt-1">{testCase.output}</div>
                  </div>
                </div>
                {testCase.description && (
                  <div className="text-xs text-gray-500 mt-2">{testCase.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution */}
      {solution && (
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-300 flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Solution</span>
            {(solution as any)?.metadata && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Phase {(solution as any).metadata.finalPhase}
              </span>
            )}
          </h3>
          
          {/* Pipeline Information */}
          {(solution as any)?.metadata && (
            <div className="bg-gray-900 rounded-md p-4 border border-green-500/20">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Sequential AI Pipeline Results</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Final Phase:</span>
                  <div className="text-green-400 font-medium">{(solution as any).metadata.finalPhase}/5</div>
                </div>
                <div>
                  <span className="text-gray-400">Execution Time:</span>
                  <div className="text-blue-400 font-medium">{(solution as any).metadata.totalExecutionTime}ms</div>
                </div>
                <div>
                  <span className="text-gray-400">Total Attempts:</span>
                  <div className="text-yellow-400 font-medium">{(solution as any).metadata.totalAttempts}</div>
                </div>
                <div>
                  <span className="text-gray-400">Success Rate:</span>
                  <div className="text-purple-400 font-medium">{(solution as any)?.testResults?.successRate || 0}%</div>
                </div>
              </div>
              {(solution as any).metadata.phaseDetails && (
                <div className="mt-3 text-xs text-gray-400">
                  <div><strong>Models Used:</strong> {(solution as any).metadata.phaseDetails.models.join(' → ')}</div>
                  <div><strong>Logic:</strong> {(solution as any).metadata.phaseDetails.logic}</div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-gray-900 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{solution.language.toUpperCase()}</span>
              <button
                onClick={handleAnalyzeComplexity}
                disabled={isLoading}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white"
              >
                <Clock className="w-3 h-3" />
                <span>Analyze</span>
              </button>
            </div>
            
            <pre className="text-sm text-gray-200 overflow-x-auto">
              <code>{solution.code}</code>
            </pre>
          </div>

          {/* Complexity Analysis */}
          {complexityAnalysis && (
            <div className="bg-gray-900 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Complexity Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-400">Time Complexity:</span>
                  <div className="font-mono bg-gray-800 p-2 rounded mt-1">{complexityAnalysis.timeComplexity}</div>
                </div>
                <div>
                  <span className="text-green-400">Space Complexity:</span>
                  <div className="font-mono bg-gray-800 p-2 rounded mt-1">{complexityAnalysis.spaceComplexity}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                <div className="font-semibold mb-1">Explanation:</div>
                <div>{complexityAnalysis.explanation}</div>
              </div>
              {complexityAnalysis.optimization && (
                <div className="mt-3 text-sm text-blue-300">
                  <div className="font-semibold mb-1">Optimization:</div>
                  <div>{complexityAnalysis.optimization}</div>
                </div>
              )}
            </div>
          )}

          {/* Approach and Explanation */}
          <div className="bg-gray-900 rounded-md p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Approach & Explanation</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <span className="text-purple-400 font-semibold">Approach:</span>
                <div className="mt-1">{solution.approach}</div>
              </div>
              <div>
                <span className="text-blue-400 font-semibold">Explanation:</span>
                <div className="mt-1">{solution.explanation}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 