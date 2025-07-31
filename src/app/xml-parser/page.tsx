import XMLParser from '../components/XMLParser';
import Link from 'next/link';

export default function XMLParserPage() {
  return (
    <div className="font-sans min-h-screen p-8 bg-white dark:bg-gray-900">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">XML Parser</h1>
          <div className="flex justify-center gap-4 flex-wrap mb-4">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🖼️ Image Generator
            </Link>
            <Link 
              href="/bulk-generate"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🚀 Bulk Generate
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Parse XML files and convert them to JSON format
          </p>
        </div>
        <XMLParser />
      </main>
    </div>
  );
}
