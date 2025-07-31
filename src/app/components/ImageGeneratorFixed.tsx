'use client';

import { useState } from 'react';

interface ImageOverlay {
  image: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  gravity?: string;
}

interface TextOverlay {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  gravity?: string;
  strokeColor?: string;
  strokeWidth?: number;
  arcDistort?: number;
}

const gravityOptions = [
  'northwest', 'north', 'northeast',
  'west', 'center', 'east',
  'southwest', 'south', 'southeast'
];

const fontFamilies = [
  'Arial', 'Helvetica', 'Times-Roman', 'Times-Bold', 'Times-Italic',
  'Courier', 'Courier-Bold', 'Courier-Oblique', 'Symbol'
];

export default function ImageGenerator() {
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [outputWidth, setOutputWidth] = useState(800);
  const [outputHeight, setOutputHeight] = useState(600);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png'>('jpg');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addImageOverlay = () => {
    setImageOverlays([...imageOverlays, {
      image: 'overlay-circle.png',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 100,
      gravity: ''
    }]);
  };

  const addTextOverlay = () => {
    setTextOverlays([...textOverlays, {
      text: 'Sample Text',
      x: 0,
      y: 0,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '',
      gravity: '',
      strokeColor: '',
      strokeWidth: 0,
      arcDistort: 0
    }]);
  };

  const updateImageOverlay = (index: number, field: keyof ImageOverlay, value: any) => {
    const newOverlays = [...imageOverlays];
    newOverlays[index] = { ...newOverlays[index], [field]: value };
    setImageOverlays(newOverlays);
  };

  const updateTextOverlay = (index: number, field: keyof TextOverlay, value: any) => {
    const newOverlays = [...textOverlays];
    newOverlays[index] = { ...newOverlays[index], [field]: value };
    setTextOverlays(newOverlays);
  };

  const removeImageOverlay = (index: number) => {
    setImageOverlays(imageOverlays.filter((_, i) => i !== index));
  };

  const removeTextOverlay = (index: number) => {
    setTextOverlays(textOverlays.filter((_, i) => i !== index));
  };

  const generateImage = async () => {
    if (imageOverlays.length === 0 && textOverlays.length === 0) {
      alert('Please add at least one overlay (image or text)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageOverlays,
          textOverlays,
          outputWidth,
          outputHeight,
          outputFormat
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        if (generatedImage) {
          URL.revokeObjectURL(generatedImage);
        }
        
        setGeneratedImage(imageUrl);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Multi-Layer Image Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Output Settings */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Output Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                <input
                  type="number"
                  value={outputWidth}
                  onChange={(e) => setOutputWidth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                <input
                  type="number"
                  value={outputHeight}
                  onChange={(e) => setOutputHeight(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'jpg' | 'png')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="jpg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Overlay Buttons */}
          <div className="flex gap-4">
            <button
              onClick={addImageOverlay}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Image Overlay
            </button>
            <button
              onClick={addTextOverlay}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Text Overlay
            </button>
          </div>

          {/* Image Overlays */}
          {imageOverlays.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Image Overlays</h2>
              {imageOverlays.map((overlay, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Image {index + 1}</h3>
                    <button
                      onClick={() => removeImageOverlay(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image File</label>
                      <select
                        value={overlay.image}
                        onChange={(e) => updateImageOverlay(index, 'image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      >
                        <option value="overlay-circle.png">Circle</option>
                        <option value="overlay-text.png">Text Box</option>
                        <option value="overlay-triangle.png">Triangle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gravity</label>
                      <select
                        value={overlay.gravity || ''}
                        onChange={(e) => updateImageOverlay(index, 'gravity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      >
                        <option value="">Use X/Y Position</option>
                        {gravityOptions.map(gravity => (
                          <option key={gravity} value={gravity}>{gravity}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X Position</label>
                      <input
                        type="number"
                        value={overlay.x || 0}
                        onChange={(e) => updateImageOverlay(index, 'x', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Y Position</label>
                      <input
                        type="number"
                        value={overlay.y || 0}
                        onChange={(e) => updateImageOverlay(index, 'y', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                      <input
                        type="number"
                        value={overlay.width || ''}
                        onChange={(e) => updateImageOverlay(index, 'width', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                      <input
                        type="number"
                        value={overlay.height || ''}
                        onChange={(e) => updateImageOverlay(index, 'height', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rotation (°)</label>
                      <input
                        type="number"
                        value={overlay.rotation || 0}
                        onChange={(e) => updateImageOverlay(index, 'rotation', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opacity (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overlay.opacity || 100}
                        onChange={(e) => updateImageOverlay(index, 'opacity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Overlays */}
          {textOverlays.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Text Overlays</h2>
              {textOverlays.map((overlay, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Text {index + 1}</h3>
                    <button
                      onClick={() => removeTextOverlay(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text</label>
                      <input
                        type="text"
                        value={overlay.text}
                        onChange={(e) => updateTextOverlay(index, 'text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font Family</label>
                      <select
                        value={overlay.fontFamily || 'Arial'}
                        onChange={(e) => updateTextOverlay(index, 'fontFamily', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      >
                        {fontFamilies.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font Size</label>
                      <input
                        type="number"
                        value={overlay.fontSize || 48}
                        onChange={(e) => updateTextOverlay(index, 'fontSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gravity</label>
                      <select
                        value={overlay.gravity || ''}
                        onChange={(e) => updateTextOverlay(index, 'gravity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      >
                        <option value="">Use X/Y Position</option>
                        {gravityOptions.map(gravity => (
                          <option key={gravity} value={gravity}>{gravity}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X Position</label>
                      <input
                        type="number"
                        value={overlay.x || 0}
                        onChange={(e) => updateTextOverlay(index, 'x', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Y Position</label>
                      <input
                        type="number"
                        value={overlay.y || 0}
                        onChange={(e) => updateTextOverlay(index, 'y', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Color</label>
                      <input
                        type="color"
                        value={overlay.color || '#000000'}
                        onChange={(e) => updateTextOverlay(index, 'color', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                      <input
                        type="color"
                        value={overlay.backgroundColor || '#ffffff'}
                        onChange={(e) => updateTextOverlay(index, 'backgroundColor', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stroke Color</label>
                      <input
                        type="color"
                        value={overlay.strokeColor || '#000000'}
                        onChange={(e) => updateTextOverlay(index, 'strokeColor', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stroke Width</label>
                      <input
                        type="number"
                        min="0"
                        value={overlay.strokeWidth || 0}
                        onChange={(e) => updateTextOverlay(index, 'strokeWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arc Distort (°)</label>
                      <input
                        type="number"
                        value={overlay.arcDistort || 0}
                        onChange={(e) => updateTextOverlay(index, 'arcDistort', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        placeholder="0 = straight, + = arch up, - = arch down"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generateImage}
            disabled={isLoading}
            className="w-full py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Preview</h2>
          {generatedImage ? (
            <div className="space-y-4">
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
              />
              <a
                href={generatedImage}
                download={`generated-image.${outputFormat}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download Image
              </a>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
