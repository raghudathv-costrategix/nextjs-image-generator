'use client';

import { useState } from 'react';
import { TemplateData, TemplateInfo } from '../lib/template-data';

interface TemplateResult {
  template: string;
  templateName?: string;
  templateId?: string;
  success: boolean;
  error?: string;
  layersProcessed?: number;
  imageOverlays?: number;
  textOverlays?: number;
  overlays?: {
    imageOverlays: any[];
    textOverlays: any[];
  };
}

interface TemplateProcessingResponse {
  success: boolean;
  processedTemplates: number;
  results: TemplateResult[];
}

interface Props {
  initialTemplateData: TemplateData;
}

export default function TemplateImageGeneratorClient({ initialTemplateData }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateData.templates[0]?.filename || '10_light.xml');
  const [templateData, setTemplateData] = useState(initialTemplateData.defaultTemplateData);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [outputWidth, setOutputWidth] = useState(800);
  const [outputHeight, setOutputHeight] = useState(600);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateProcessing, setTemplateProcessing] = useState<TemplateProcessingResponse | null>(null);

  const generateFromTemplate = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateFile: selectedTemplate,
          templateData,
          outputWidth,
          outputHeight,
          outputFormat
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate image' }));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      // Convert the response to a blob and create object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const processAllTemplates = async () => {
    setIsLoading(true);
    setError('');
    setTemplateProcessing(null);

    try {
      const response = await fetch(`/api/generate-from-template?format=${outputFormat}&width=${outputWidth}&height=${outputHeight}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process templates' }));
        throw new Error(errorData.error || 'Failed to process templates');
      }

      const data = await response.json();
      setTemplateProcessing(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImageFromOverlays = async (overlays: any) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageOverlays: overlays.imageOverlays,
          textOverlays: overlays.textOverlays,
          outputWidth,
          outputHeight,
          outputFormat
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // Open in new tab
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
      }

    } catch (err) {
      console.error('Error generating image:', err);
    }
  };

  const updateTemplateData = (key: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper function to check if a field is a color field
  const isColorField = (key: string): boolean => {
    return key.toLowerCase().includes('color');
  };

  // Helper function to get the appropriate icon for each field type
  const getFieldIcon = (key: string): string => {
    if (isColorField(key)) return '🎨';
    if (key.includes('IMAGE')) return '🖼️';
    if (key.includes('YEAR')) return '📅';
    if (key.includes('NAME') || key.includes('MASCOT')) return '🏫';
    return '📝';
  };

  // Predefined color presets for quick selection
  const colorPresets = [
    { name: 'Navy Blue', value: '#003366' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Crimson', value: '#DC143C' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Royal Purple', value: '#7851A9' },
    { name: 'Orange', value: '#FF8C00' },
    { name: 'Maroon', value: '#800000' },
    { name: 'Steel Blue', value: '#4682B4' }
  ];

  // Generate random color
  const generateRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate random colors for all color fields
  const randomizeColors = () => {
    const newTemplateData = { ...templateData };
    Object.keys(newTemplateData).forEach(key => {
      if (isColorField(key)) {
        (newTemplateData as any)[key] = generateRandomColor();
      }
    });
    setTemplateData(newTemplateData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 Template-Based Image Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create stunning multi-layered images using customizable XML templates with advanced text effects and positioning
          </p>
        </div>

        {/* Server-Side Template Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📊</span> Available Templates (Server-Side Loaded)
            </h2>
            <p className="text-green-100 mt-2">
              {initialTemplateData.templates.length} templates pre-loaded from server
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {initialTemplateData.templates.map((template) => (
                <div key={template.filename} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedTemplate === template.filename 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`} onClick={() => setSelectedTemplate(template.filename)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {template.templateName}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {template.success ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>File: {template.filename}</p>
                    <p>ID: {template.templateId}</p>
                    <p>Total Layers: {template.layerCount}</p>
                    <p>Images: {template.imageLayerCount} | Text: {template.textLayerCount}</p>
                  </div>
                  {template.error && (
                    <p className="text-red-600 text-xs mt-2">{template.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Template Selection Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span> Template Configuration
            </h2>
            <p className="text-blue-100 mt-2">
              Customize your selected template and generate images
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Output Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🖼️ Output Format:
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="jpg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  📐 Width (px):
                </label>
                <input
                  type="number"
                  value={outputWidth}
                  onChange={(e) => setOutputWidth(parseInt(e.target.value))}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  📏 Height (px):
                </label>
                <input
                  type="number"
                  value={outputHeight}
                  onChange={(e) => setOutputHeight(parseInt(e.target.value))}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Template Data */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span>🏫</span> Template Data Configuration
                </h3>
                <button
                  onClick={randomizeColors}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                  title="Generate random colors for all color fields"
                >
                  🎲 Random Colors
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(templateData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span>{getFieldIcon(key)}</span>
                      {key.replace(/_/g, ' ')}:
                    </label>
                    
                    {isColorField(key) ? (
                      <div className="space-y-3">
                        {/* Color Picker and Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateTemplateData(key, e.target.value)}
                            className="w-12 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700"
                            title={`Select ${key.replace(/_/g, ' ').toLowerCase()}`}
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateTemplateData(key, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors font-mono"
                            placeholder="#000000"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                          <button
                            type="button"
                            onClick={() => updateTemplateData(key, generateRandomColor())}
                            className="px-2 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                            title="Generate random color"
                          >
                            🎲
                          </button>
                        </div>
                        
                        {/* Color Preview */}
                        <div 
                          className="w-full h-6 rounded-md border border-gray-300 dark:border-gray-600 shadow-inner"
                          style={{ backgroundColor: value }}
                          title={`Preview of ${value}`}
                        ></div>
                        
                        {/* Color Presets */}
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Colors:</div>
                          <div className="grid grid-cols-4 gap-1">
                            {colorPresets.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => updateTemplateData(key, preset.value)}
                                className={`w-full h-6 rounded border-2 hover:scale-110 transition-all shadow-sm ${
                                  value.toLowerCase() === preset.value.toLowerCase() 
                                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={`${preset.name} (${preset.value})`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : key.includes('IMAGE') ? (
                      <select
                        value={value}
                        onChange={(e) => updateTemplateData(key, e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                      >
                        {initialTemplateData.availableImages.map(image => (
                          <option key={image} value={image}>
                            {image.replace(/\.(png|jpg|jpeg)$/i, '').replace(/-/g, ' ')}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateTemplateData(key, e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                        placeholder={`Enter ${key.toLowerCase().replace(/_/g, ' ')}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={generateFromTemplate}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🎨</span> Generate Image
                  </span>
                )}
              </button>

              <button
                onClick={processAllTemplates}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>⚡</span> Process All Templates
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Error Occurred
                </h3>
                <p className="text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🖼️</span> Generated Image
              </h2>
              <p className="text-purple-100 mt-2">
                Your multi-layered image has been successfully generated
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <img
                  src={generatedImage}
                  alt="Generated from template"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href={generatedImage}
                  download="generated-image.jpg"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>💾</span> Download Image
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Template Processing Results */}
        {templateProcessing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📊</span> Template Processing Results
              </h2>
              <p className="text-indigo-100 mt-2">
                Processed {templateProcessing.processedTemplates} templates with layer analysis
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {templateProcessing.results.map((result, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {result.templateName || result.template}
                        {result.templateId && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            (ID: {result.templateId})
                          </span>
                        )}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.success ? '✅ Success' : '❌ Failed'}
                      </span>
                    </div>

                    {result.success && result.overlays && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                          <div className="font-medium text-blue-800 dark:text-blue-200">Total Layers</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.layersProcessed}</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                          <div className="font-medium text-purple-800 dark:text-purple-200">Image Overlays</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.imageOverlays}</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                          <div className="font-medium text-orange-800 dark:text-orange-200">Text Overlays</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.textOverlays}</div>
                        </div>
                      </div>
                    )}

                    {result.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mt-3">
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          <span className="font-medium">Error:</span> {result.error}
                        </p>
                      </div>
                    )}
                  </div>

                  {result.success && result.overlays && (
                    <div className="p-4 space-y-4">
                      <button
                        onClick={() => generateImageFromOverlays(result.overlays)}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span>🎨</span> Generate Image
                        </span>
                      </button>
                      
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                          <span className="transition-transform group-open:rotate-90">▶</span>
                          View Overlay Details
                        </summary>
                        <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <pre className="text-xs text-gray-700 dark:text-gray-300 p-4 overflow-auto max-h-64 leading-relaxed">
                            {JSON.stringify(result.overlays, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
