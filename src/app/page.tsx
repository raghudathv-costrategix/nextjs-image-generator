'use client';

import ImageGenerator from './components/ImageGeneratorFixed';
import AppLayout from './components/AppLayout';

export default function Home() {
  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ Single Image Generator
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create custom images with text and image overlays. Perfect for social media posts, banners, and marketing materials.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h3 className="text-xl font-bold text-white">Interactive Generator</h3>
            <p className="text-blue-100 mt-2">Upload images, add text, and customize your design</p>
          </div>
          <div className="p-6">
            <ImageGenerator />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">🖼️</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Multiple Formats</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Support for JPG, PNG, and various image formats</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Precise Control</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fine-tune positioning, colors, and effects</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Preview</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">See changes instantly as you design</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
