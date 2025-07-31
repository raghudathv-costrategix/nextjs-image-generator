import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { parseString } from 'xml2js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    const format = searchParams.get('format') || 'json'; // json or raw

    if (!filename) {
      return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
    }

    // Security check: only allow files in the templates directory
    const templatesDir = path.join(process.cwd(), 'templates');
    const filePath = path.join(templatesDir, filename);

    // Ensure the file is within the templates directory (prevent path traversal)
    if (!filePath.startsWith(templatesDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the XML file
    const xmlContent = await readFile(filePath, 'utf-8');

    if (format === 'raw') {
      // Return raw XML content
      return new NextResponse(xmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

    // Parse XML to JSON
    const parsedXML = await new Promise((resolve, reject) => {
      parseString(xmlContent, {
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
      }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return NextResponse.json({
      success: true,
      filename,
      data: parsedXML,
      message: 'XML parsed successfully'
    });

  } catch (error) {
    console.error('Error parsing XML:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse XML', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { xmlContent, options = {} } = await request.json();

    if (!xmlContent) {
      return NextResponse.json({ error: 'XML content is required' }, { status: 400 });
    }

    // Default parsing options
    const parseOptions = {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      trim: true,
      normalize: true,
      ...options
    };

    // Parse the provided XML content
    const parsedXML = await new Promise((resolve, reject) => {
      parseString(xmlContent, parseOptions, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return NextResponse.json({
      success: true,
      data: parsedXML,
      message: 'XML parsed successfully'
    });

  } catch (error) {
    console.error('Error parsing XML:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse XML', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
