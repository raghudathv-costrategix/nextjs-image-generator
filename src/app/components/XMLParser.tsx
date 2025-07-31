'use client';

import { useState } from 'react';

interface ParsedXML {
  success: boolean;
  filename?: string;
  data: any;
  message: string;
}

export default function XMLParser() {
  const [selectedFile, setSelectedFile] = useState('10_light.xml');
  const [format, setFormat] = useState('json');
  const [xmlContent, setXmlContent] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedXML | null>(null);
  const [rawXml, setRawXml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const parseFileXML = async () => {
    setIsLoading(true);
    setError('');
    setParsedResult(null);
    setRawXml('');

    try {
      const response = await fetch(`/api/parse-xml?file=${encodeURIComponent(selectedFile)}&format=${format}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse response' }));
        throw new Error(errorData.error || 'Failed to parse XML');
      }

      if (format === 'raw') {
        const xmlData = await response.text();
        setRawXml(xmlData);
      } else {
        const data = await response.json();
        setParsedResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const parseCustomXML = async () => {
    if (!xmlContent.trim()) {
      setError('Please enter XML content');
      return;
    }

    setIsLoading(true);
    setError('');
    setParsedResult(null);
    setRawXml('');

    try {
      const response = await fetch('/api/parse-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xmlContent: xmlContent.trim(),
          options: {
            explicitArray: false,
            ignoreAttrs: false,
            mergeAttrs: true,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse response' }));
        throw new Error(errorData.error || 'Failed to parse XML');
      }

      const data = await response.json();
      setParsedResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Parse XML File</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="xmlFile" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select XML File
            </label>
            <select
              id="xmlFile"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
            >
              <option value="10_light.xml">10_light.xml</option>
							<option value="11_light.xml">11_light.xml</option>
							<option value="12_light.xml">12_light.xml</option>
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Output Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
            >
              <option value="json">JSON</option>
              <option value="raw">Raw XML</option>
            </select>
          </div>
        </div>

        <button
          onClick={parseFileXML}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600 transition-colors"
        >
          {isLoading ? 'Parsing...' : 'Parse File'}
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Parse Custom XML</h2>
        
        <div className="mb-4">
          <label htmlFor="xmlContent" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            XML Content
          </label>
          <textarea
            id="xmlContent"
            value={xmlContent}
            onChange={(e) => setXmlContent(e.target.value)}
            placeholder="Enter your XML content here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 font-mono text-sm"
          />
        </div>

        <button
          onClick={parseCustomXML}
          disabled={isLoading || !xmlContent.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-800 dark:disabled:bg-gray-600 transition-colors"
        >
          {isLoading ? 'Parsing...' : 'Parse Custom XML'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          {error}
        </div>
      )}

      {rawXml && (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Raw XML Content</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm font-mono max-h-96">
            {rawXml}
          </pre>
        </div>
      )}

      {parsedResult && (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Parsed JSON Result</h3>
          <div className="mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {parsedResult.filename && `File: ${parsedResult.filename} | `}
              Status: {parsedResult.message}
            </span>
          </div>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm font-mono max-h-96">
            {JSON.stringify(parsedResult.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
