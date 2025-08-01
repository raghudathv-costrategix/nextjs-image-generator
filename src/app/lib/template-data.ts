import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { unstable_cache } from 'next/cache';

export interface TemplateInfo {
  filename: string;
  templateName: string;
  templateId: string;
  layerCount: number;
  imageLayerCount: number;
  textLayerCount: number;
  success: boolean;
  error?: string;
}

export interface TemplateData {
  templates: TemplateInfo[];
  defaultTemplateData: Record<string, string>;
  availableImages: string[];
}

// Server action to parse XML template
const parseXMLFile = async (filePath: string): Promise<any> => {
  const xmlContent = await readFile(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    parseString(xmlContent, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Server function to get all template information (cached)
export const getTemplateData = unstable_cache(
  async (): Promise<TemplateData> => {
    const templatesDir = path.join(process.cwd(), 'templates');
    const templateFiles = ['10_light.xml', '11_light.xml', '12_light.xml'];
    
    const templates: TemplateInfo[] = [];
    
    // Process each template file
    for (const templateFile of templateFiles) {
      try {
        const filePath = path.join(templatesDir, templateFile);
        
        if (!existsSync(filePath)) {
          templates.push({
            filename: templateFile,
            templateName: 'Unknown',
            templateId: '0',
            layerCount: 0,
            imageLayerCount: 0,
            textLayerCount: 0,
            success: false,
            error: 'Template file not found'
          });
          continue;
        }

        // Parse the XML template
        const parsedTemplate = await parseXMLFile(filePath);
        
        if (!parsedTemplate.template?.layers?.layer) {
          templates.push({
            filename: templateFile,
            templateName: 'Unknown',
            templateId: '0',
            layerCount: 0,
            imageLayerCount: 0,
            textLayerCount: 0,
            success: false,
            error: 'Invalid template format'
          });
          continue;
        }

        // Process layers
        const layers = Array.isArray(parsedTemplate.template.layers.layer) 
          ? parsedTemplate.template.layers.layer 
          : [parsedTemplate.template.layers.layer];

        const imageLayerCount = layers.filter((layer: any) => layer.type === 'IMAGE').length;
        const textLayerCount = layers.filter((layer: any) => layer.type === 'TEXT').length;

        templates.push({
          filename: templateFile,
          templateName: parsedTemplate.template.name || 'Unknown',
          templateId: parsedTemplate.template.id || '0',
          layerCount: layers.length,
          imageLayerCount,
          textLayerCount,
          success: true
        });

      } catch (error) {
        templates.push({
          filename: templateFile,
          templateName: 'Unknown',
          templateId: '0',
          layerCount: 0,
          imageLayerCount: 0,
          textLayerCount: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get available image files
    const availableImages: string[] = [];
    try {
      // For now, use hardcoded list. In production, you'd scan the directory
      availableImages.push(
        'overlay-circle.png',
        'overlay-triangle.png', 
        'overlay-text.png',
        'base-image.jpg'
      );
    } catch (error) {
      // Fallback to hardcoded list
      availableImages.push(
        'overlay-circle.png',
        'overlay-triangle.png',
        'overlay-text.png',
        'base-image.jpg'
      );
    }

    // Default template data
    const defaultTemplateData = {
      'SCHOOL_NICK_NAME': 'EAGLES',
      'SCHOOL_NAME': 'RIVERSIDE HIGH SCHOOL',
      'SCHOOL_MASCOT': 'EAGLES',
      'SCHOOL_YEAR': '1985',
      'SCHOOL_INITIAL': 'R',
      'SCHOOL_MASCOT_WITH_ARTICLE': 'THE EAGLES',
      'SCHOOL_DARK_COLOR': '#003366',
      'SCHOOL_OTHER_COLOR': '#FFD700',
      'SCHOOL_MASCOT_IMAGE': 'overlay-circle.png'
    };

    return {
      templates,
      defaultTemplateData,
      availableImages
    };
  },
  ['template-data'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['templates']
  }
);
