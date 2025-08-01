import XMLParser from '../components/XMLParser';
import AppLayout from '../components/AppLayout';

export default function XMLParserPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            📄 XML Parser
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Parse XML template files and analyze their structure and layers
          </p>
        </div>
        <XMLParser />
      </div>
    </AppLayout>
  );
}
