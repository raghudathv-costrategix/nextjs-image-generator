import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { parseString } from 'xml2js';

// Helper function to parse XML
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

// Helper function to convert template layer to overlay format
const convertLayerToOverlay = (layer: any, templateData: any = {}) => {
  const type = layer.type;
  
  if (type === 'TEXT') {
    // Handle arc distortion from various arc field formats
    let arcDistort = 0;
    if (layer.arc) {
      // Extract number from arc strings like "-distort Arc 15" or "-rotate 180 -distort Arc "15 180""
      const arcMatch = layer.arc.match(/Arc\s+(["\']?)(-?\d+(?:\.\d+)?)/);
      if (arcMatch) {
        arcDistort = parseFloat(arcMatch[2]);
      }
    }
    if (layer.arcDistort) {
      arcDistort = parseFloat(layer.arcDistort);
    }

    return {
      type: 'text',
      text: templateData[layer.text] || layer.text || 'Sample Text',
      x: parseFloat(layer.position?.x || 0),
      y: parseFloat(layer.position?.y || 0),
      fontSize: layer.size?.height ? Math.max(12, parseFloat(layer.size.height) * 2) : 48,
      fontFamily: layer.font,
      color: templateData[layer.color] || layer.color || 'black',
      backgroundColor: layer.backgound_color === 'transparent' ? undefined : layer.backgound_color,
      gravity: layer.gravity,
      strokeColor: layer.stroke_color,
      strokeWidth: layer.stroke_width ? parseInt(layer.stroke_width) : undefined,
      rotation: layer.rotation ? parseFloat(layer.rotation) : undefined,
      arcDistort: arcDistort !== 0 ? arcDistort : undefined
    };
  } else if (type === 'IMAGE') {
    return {
      type: 'image',
      image: templateData[layer.path] || layer.path || 'overlay-circle.png',
      x: parseFloat(layer.position?.x || 0),
      y: parseFloat(layer.position?.y || 0),
      width: layer.size?.width ? parseFloat(layer.size.width) * 8 : undefined, // Scale up for ImageMagick
      height: layer.size?.height ? parseFloat(layer.size.height) * 6 : undefined, // Scale up for ImageMagick
      rotation: layer.rotation ? parseFloat(layer.rotation) : undefined,
      opacity: layer.opacity ? parseFloat(layer.opacity) : 100,
      gravity: layer.gravity
    };
  }
  
  return null;
};

export async function POST(request: NextRequest) {
  try {
    const { 
      templateFile,
      templateData = {},
      outputWidth = 800,
      outputHeight = 600,
      outputFormat = 'jpg'
    } = await request.json();

    if (!templateFile) {
      return NextResponse.json({ error: 'Template file is required' }, { status: 400 });
    }

    // Security check: only allow files in the templates directory
    const templatesDir = path.join(process.cwd(), 'templates');
    const filePath = path.join(templatesDir, templateFile);

    // Ensure the file is within the templates directory (prevent path traversal)
    if (!filePath.startsWith(templatesDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    // Parse the XML template
    const parsedTemplate = await parseXMLFile(filePath);
    
    if (!parsedTemplate.template?.layers?.layer) {
      return NextResponse.json({ error: 'Invalid template format' }, { status: 400 });
    }

    // Ensure layers is an array
    const layers = Array.isArray(parsedTemplate.template.layers.layer) 
      ? parsedTemplate.template.layers.layer 
      : [parsedTemplate.template.layers.layer];

    // Sort layers by sequence
    layers.sort((a: any, b: any) => parseInt(a.sequence || 0) - parseInt(b.sequence || 0));

    // Convert layers to overlays
    const imageOverlays = [];
    const textOverlays = [];

    for (const layer of layers) {
      const overlay = convertLayerToOverlay(layer, templateData);
      if (overlay) {
        if (overlay.type === 'image') {
          const { type, ...imageOverlay } = overlay;
          imageOverlays.push(imageOverlay);
        } else if (overlay.type === 'text') {
          const { type, ...textOverlay } = overlay;
          textOverlays.push(textOverlay);
        }
      }
    }

    // Call the generate-image API
    const generateImageResponse = await fetch(new URL('/api/generate-image', request.url), {
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

    if (!generateImageResponse.ok) {
      const errorData = await generateImageResponse.json().catch(() => ({ error: 'Failed to generate image' }));
      return NextResponse.json({ error: errorData.error || 'Failed to generate image' }, { status: 500 });
    }

    // Return the generated image
    const imageBuffer = await generateImageResponse.arrayBuffer();
    const contentType = generateImageResponse.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error generating image from template:', error);
    return NextResponse.json(
      { error: 'Failed to generate image from template', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// GET endpoint to process all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFormat = searchParams.get('format') || 'jpg';
    const outputWidth = parseInt(searchParams.get('width') || '800');
    const outputHeight = parseInt(searchParams.get('height') || '600');

    const templatesDir = path.join(process.cwd(), 'templates');
    const templateFiles = ['10_light.xml', '11_light.xml', '12_light.xml'];
    
    const results = [];

    // Sample template data for demonstration
    const sampleTemplateData = {
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

    for (const templateFile of templateFiles) {
      try {
        const filePath = path.join(templatesDir, templateFile);
        
        if (!existsSync(filePath)) {
          results.push({
            template: templateFile,
            success: false,
            error: 'Template file not found'
          });
          continue;
        }

        // Parse the XML template
        const parsedTemplate = await parseXMLFile(filePath);
        
        if (!parsedTemplate.template?.layers?.layer) {
          results.push({
            template: templateFile,
            success: false,
            error: 'Invalid template format'
          });
          continue;
        }

        // Process layers
        const layers = Array.isArray(parsedTemplate.template.layers.layer) 
          ? parsedTemplate.template.layers.layer 
          : [parsedTemplate.template.layers.layer];

        layers.sort((a: any, b: any) => parseInt(a.sequence || 0) - parseInt(b.sequence || 0));

        const imageOverlays = [];
        const textOverlays = [];

        for (const layer of layers) {
          const overlay = convertLayerToOverlay(layer, sampleTemplateData);
          if (overlay) {
            if (overlay.type === 'image') {
              const { type, ...imageOverlay } = overlay;
              imageOverlays.push(imageOverlay);
            } else if (overlay.type === 'text') {
              const { type, ...textOverlay } = overlay;
              textOverlays.push(textOverlay);
            }
          }
        }

        results.push({
          template: templateFile,
          templateName: parsedTemplate.template.name,
          templateId: parsedTemplate.template.id,
          success: true,
          layersProcessed: layers.length,
          imageOverlays: imageOverlays.length,
          textOverlays: textOverlays.length,
          overlays: {
            imageOverlays,
            textOverlays
          }
        });

      } catch (error) {
        results.push({
          template: templateFile,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedTemplates: results.length,
      results
    });

  } catch (error) {
    console.error('Error processing templates:', error);
    return NextResponse.json(
      { error: 'Failed to process templates', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
