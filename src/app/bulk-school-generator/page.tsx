'use client';

import { useState } from 'react';
import AppLayout from '../components/AppLayout';

interface GenerationResult {
  schoolId: number;
  schoolName: string;
  status: 'success' | 'error';
  imageUrl?: string;
  mascot?: string;
  year?: number;
  colors?: {
    dark: string;
    other: string;
  };
  error?: string;
}

interface BulkGenerationResponse {
  success: boolean;
  message: string;
  statistics: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
  };
  results: GenerationResult[];
  schoolData: any[];
}

export default function BulkSchoolGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BulkGenerationResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('10_light.xml');
  const [count, setCount] = useState(100);
  const [progress, setProgress] = useState(0);

  const templates = [
    { value: '10_light.xml', label: 'Template 10 - Vertical Layout' },
    { value: '11_light.xml', label: 'Template 11 - Horizontal Layout' },
    { value: '12_light.xml', label: 'Template 12 - Mixed Layout' }
  ];

  const generateBulkImages = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const response = await fetch('/api/bulk-generate-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count,
          template: selectedTemplate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkGenerationResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(data);
      
    } catch (error) {
      console.error('Bulk generation failed:', error);
      clearInterval(progressInterval);
      setProgress(0);
      
      // Show error in results
      setResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        statistics: {
          total: count,
          successful: 0,
          failed: count,
          successRate: '0.0%'
        },
        results: [],
        schoolData: []
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk-school-images-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏫 Bulk School Image Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate multi-layered images for schools using XML templates and view them instantly in your browser
          </p>
        </div>

      {/* Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            🏫 Generation Configuration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure the bulk image generation settings
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Number of Schools
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 100)}
                min="1"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {templates.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateBulkImages}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating {count} Images...
                </>
              ) : (
                <>
                  🏫 Generate {count} School Images
                </>
              )}
            </button>
            
            {results && (
              <button
                onClick={() => setResults(null)}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
              >
                Clear Results
              </button>
            )}
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className={`text-xl font-semibold mb-1 flex items-center gap-2 ${results.success ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                  {results.success ? '👁️ Generation Results' : '❌ Generation Failed'}
                </h2>
                <p className={`text-sm ${results.success ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                  {results.message}
                </p>
              </div>
              {results.success && (
                <button
                  onClick={downloadResults}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  📥 Download Results
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {results.success ? (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.statistics.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Schools
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.statistics.successful}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Successful
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.statistics.failed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Failed
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.statistics.successRate}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Success Rate
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🖼️ Generated Images Gallery
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {results.results.filter(r => r.status === 'success').length} images generated
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.results
                  .filter(result => result.status === 'success' && result.imageUrl)
                  .map((result) => (
                    <div
                      key={result.schoolId}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={result.imageUrl}
                          alt={`${result.schoolName} - ${result.mascot}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-1">
                          {result.schoolName}
                        </h4>
                        
                        <div className="space-y-2">
                          {result.mascot && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 dark:text-gray-400">🦅 Mascot:</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{result.mascot}</span>
                            </div>
                          )}
                          
                          {result.year && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 dark:text-gray-400">📅 Est:</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{result.year}</span>
                            </div>
                          )}
                          
                          {result.colors && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 dark:text-gray-400">🎨 Colors:</span>
                              <div className="flex gap-1">
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: result.colors.dark }}
                                  title={result.colors.dark}
                                />
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: result.colors.other }}
                                  title={result.colors.other}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = result.imageUrl!;
                              link.download = `${result.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-xs font-medium transition-colors"
                          >
                            📥 Download
                          </button>
                          <button
                            onClick={() => window.open(result.imageUrl, '_blank')}
                            className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs font-medium transition-colors"
                          >
                            🔍 View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Error Results Summary */}
              {results.results.some(r => r.status === 'error') && (
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-red-600 dark:text-red-400 mb-4">
                    ❌ Failed Generations ({results.results.filter(r => r.status === 'error').length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.results
                      .filter(result => result.status === 'error')
                      .map((result) => (
                        <div
                          key={result.schoolId}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-red-800 dark:text-red-200">
                              {result.schoolName}
                            </span>
                            {result.error && (
                              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {result.error}
                              </div>
                            )}
                          </div>
                          <span className="text-red-500 dark:text-red-400">❌</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            </>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
                  ❌ Generation Failed
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {results.message}
                </p>
                <button
                  onClick={() => setResults(null)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
