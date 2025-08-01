'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      id: 'single-generator',
      label: 'Single Image Generator',
      icon: '✨',
      description: 'Create custom images with text overlays',
      href: '/'
    },
    {
      id: 'template-generator',
      label: 'Template Generator',
      icon: '🎨',
      description: 'Multi-layered images from XML templates',
      href: '/template-generator'
    },
    {
      id: 'xml-parser',
      label: 'XML Parser',
      icon: '📄',
      description: 'Parse and analyze XML template files',
      href: '/xml-parser'
    },
    {
      id: 'bulk-generator',
      label: 'Bulk Generator',
      icon: '🚀',
      description: 'Generate thousands of images with batch processing',
      href: '/bulk-generate'
    },
    {
      id: 'school-generator',
      label: 'School Batch Generator',
      icon: '🏫',
      description: 'Generate school images with random data',
      href: '/bulk-school-generator'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Left Navigation Sidebar */}
        <aside className="w-80 min-h-screen bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="text-center mb-8">
              <Link href="/" className="block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  🎨 Image Generator Suite
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Complete toolkit for image generation
                </p>
              </Link>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`block w-full p-4 rounded-lg border transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${
                        isActive(item.href)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                    {!isActive(item.href) && (
                      <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500">
                        →
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Platform Stats */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                🌟 Platform Features
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">⚡</span>
                  ImageMagick powered
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🎨</span>
                  XML template support
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🚀</span>
                  Batch processing
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🌙</span>
                  Dark mode ready
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
