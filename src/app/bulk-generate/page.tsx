'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GeneratedImageData {
  id: number;
  imageUrl: string;
  text: string;
  overlayImage: string;
  timestamp: number;
}

const overlayImages = [
  'overlay-circle.png',
  'overlay-text.png',
  'overlay-triangle.png'
];

const randomWords = [
  'Hello', 'World', 'Amazing', 'Creative', 'Design', 'Awesome', 'Cool', 'Epic',
  'Fantastic', 'Great', 'Incredible', 'Magic', 'Perfect', 'Super', 'Wonder',
  'Brilliant', 'Excellent', 'Fabulous', 'Gorgeous', 'Happy', 'Joy', 'Love',
  'Peace', 'Success', 'Victory', 'Winner', 'Champion', 'Star', 'Hero', 'Dream',
  'Hope', 'Faith', 'Trust', 'Power', 'Strong', 'Bold', 'Brave', 'Smart', 'Wise',
  'Art', 'Beauty', 'Color', 'Light', 'Shine', 'Glow', 'Spark', 'Fire', 'Energy'
];

const randomColors = [
  'red', 'blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'black', 'white',
  'brown', 'gray', 'cyan', 'magenta', 'lime', 'navy', 'maroon', 'olive', 'teal'
];

function getRandomText(): string {
  const numWords = Math.floor(Math.random() * 3) + 1; // 1-3 words
  const words = [];
  for (let i = 0; i < numWords; i++) {
    words.push(randomWords[Math.floor(Math.random() * randomWords.length)]);
  }
  return words.join(' ');
}

function getRandomOverlay(): string {
  return overlayImages[Math.floor(Math.random() * overlayImages.length)];
}

function getRandomColor(): string {
  return randomColors[Math.floor(Math.random() * randomColors.length)];
}

export default function BulkImageGenerator() {
  const [images, setImages] = useState<GeneratedImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const BATCH_SIZE = 10; // Generate 10 images at a time
  const TOTAL_IMAGES = 1000;
  const TOTAL_BATCHES = Math.ceil(TOTAL_IMAGES / BATCH_SIZE);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.imageUrl);
        }
      });
    };
  }, [images]);

  const generateSingleImage = async (id: number, signal: AbortSignal): Promise<GeneratedImageData | null> => {
    try {
      const text = getRandomText();
      const overlayImage = getRandomOverlay();
      const color = getRandomColor();
      
      // Random positioning and styling
      const fontSize = Math.floor(Math.random() * 30) + 20; // 20-50px
      const textX = Math.floor(Math.random() * 40) - 20; // -20 to 20
      const textY = Math.floor(Math.random() * 40) - 20; // -20 to 20
      const overlayX = Math.floor(Math.random() * 80) - 40; // -40 to 40
      const overlayY = Math.floor(Math.random() * 80) - 40; // -40 to 40
      const overlayRotation = Math.floor(Math.random() * 360); // 0-360 degrees
      const overlayOpacity = Math.floor(Math.random() * 50) + 50; // 50-100%
      const overlaySize = Math.floor(Math.random() * 50) + 50; // 50-100px

      const requestBody = {
        text,
        fontSize,
        color,
        x: textX,
        y: textY,
        overlayImage,
        overlayX,
        overlayY,
        overlayWidth: overlaySize,
        overlayHeight: overlaySize,
        overlayRotation,
        overlayOpacity,
        outputWidth: 100,
        outputHeight: 100
      };

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image ${id}: ${response.statusText}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        id,
        imageUrl,
        text,
        overlayImage,
        timestamp: Date.now()
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error(`Error generating image ${id}:`, error);
      setErrors(prev => [...prev, `Image ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      return null;
    }
  };

  const generateBatch = async (batchIndex: number, signal: AbortSignal): Promise<GeneratedImageData[]> => {
    const batchPromises = [];
    const startId = batchIndex * BATCH_SIZE + 1;
    
    for (let i = 0; i < BATCH_SIZE && startId + i <= TOTAL_IMAGES; i++) {
      batchPromises.push(generateSingleImage(startId + i, signal));
    }

    const results = await Promise.allSettled(batchPromises);
    const successfulImages: GeneratedImageData[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        successfulImages.push(result.value);
      }
    });

    return successfulImages;
  };

  const startGeneration = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setCurrentBatch(0);
    setTotalGenerated(0);
    setErrors([]);
    setImages([]);

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      for (let batchIndex = 0; batchIndex < TOTAL_BATCHES; batchIndex++) {
        if (signal.aborted) break;

        setCurrentBatch(batchIndex + 1);
        
        const batchImages = await generateBatch(batchIndex, signal);
        
        if (!signal.aborted) {
          setImages(prev => [...prev, ...batchImages]);
          setTotalGenerated(prev => prev + batchImages.length);
        }

        // Small delay between batches to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Generation error:', error);
      setErrors(prev => [...prev, `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const clearImages = () => {
    if (isGenerating) {
      stopGeneration();
    }
    
    // Clean up blob URLs
    images.forEach(img => {
      if (img.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.imageUrl);
      }
    });
    
    setImages([]);
    setTotalGenerated(0);
    setCurrentBatch(0);
    setErrors([]);
  };

  const downloadAllImages = () => {
    images.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.imageUrl;
      link.download = `generated-image-${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add small delay between downloads
      setTimeout(() => {}, index * 50);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Single Image Generator
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bulk Image Generator
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Generate 1000 unique 100x100 images with random text and overlay combinations
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={startGeneration}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? 'Generating...' : 'Start Generation'}
            </button>
            
            {isGenerating && (
              <button
                onClick={stopGeneration}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Stop Generation
              </button>
            )}
            
            <button
              onClick={clearImages}
              disabled={isGenerating}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Clear All
            </button>
            
            {images.length > 0 && (
              <button
                onClick={downloadAllImages}
                disabled={isGenerating}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Download All
              </button>
            )}
          </div>

          {isGenerating && (
            <div className="mb-6">
              <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Batch Progress</span>
                      <span>{currentBatch} / {TOTAL_BATCHES}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentBatch / TOTAL_BATCHES) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Images</span>
                      <span>{totalGenerated} / {TOTAL_IMAGES}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(totalGenerated / TOTAL_IMAGES) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-6 max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Errors ({errors.length})</h3>
                <div className="max-h-32 overflow-y-auto text-sm text-red-700">
                  {errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="mb-1">{error}</div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-red-600 font-medium">
                      ... and {errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Generated</div>
                <div className="text-2xl font-bold text-green-600">{totalGenerated}</div>
              </div>
              <div>
                <div className="text-gray-600">Errors</div>
                <div className="text-2xl font-bold text-red-600">{errors.length}</div>
              </div>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Generated Images ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <Image
                      src={img.imageUrl}
                      alt={`Generated image ${img.id}: ${img.text}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center">
                    <div className="font-semibold mb-1">#{img.id}</div>
                    <div className="mb-1">"{img.text}"</div>
                    <div className="text-gray-300">{img.overlayImage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
