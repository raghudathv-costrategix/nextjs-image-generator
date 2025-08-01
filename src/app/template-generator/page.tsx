import { Metadata } from 'next';
import { getTemplateData } from '../lib/template-data';
import TemplateImageGeneratorClient from '../components/TemplateImageGeneratorClient';
import AppLayout from '../components/AppLayout';

export const metadata: Metadata = {
  title: 'Template-Based Image Generator | Multi-Layered Image Creation',
  description: 'Create stunning multi-layered images using customizable XML templates with advanced text effects, color pickers, and precise positioning. Generate professional images for schools, organizations, and brands.',
  keywords: ['image generator', 'template', 'multi-layer', 'XML', 'school graphics', 'text overlay', 'color picker'],
  openGraph: {
    title: 'Template-Based Image Generator',
    description: 'Create stunning multi-layered images using customizable XML templates',
    type: 'website',
  },
};

export default async function TemplateGeneratorPage() {
  // Fetch template data on the server
  const templateData = await getTemplateData();

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <TemplateImageGeneratorClient 
          initialTemplateData={templateData}
        />
      </div>
    </AppLayout>
  );
}
