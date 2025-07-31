import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface ImageOverlay {
  image: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  gravity?: string;
}

interface TextOverlay {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  gravity?: string;
  strokeColor?: string;
  strokeWidth?: number;
  arcDistort?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      // Legacy single overlay support
      text, 
      fontSize = 48, 
      color = 'black', 
      x = 0, 
      y = 0,
      overlayImage,
      overlayX = 0,
      overlayY = 0,
      overlayWidth,
      overlayHeight,
      overlayRotation = 0,
      overlayOpacity = 100,
      
      // New multiple overlay support
      imageOverlays = [],
      textOverlays = [],
      
      // Output settings
      outputWidth = 800,
      outputHeight = 600,
      outputFormat = 'jpg'
    } = await request.json();

    // Convert legacy single overlay to new array format
    const allImageOverlays: ImageOverlay[] = [...imageOverlays];
    const allTextOverlays: TextOverlay[] = [...textOverlays];

    if (overlayImage) {
      allImageOverlays.push({
        image: overlayImage,
        x: overlayX,
        y: overlayY,
        width: overlayWidth,
        height: overlayHeight,
        rotation: overlayRotation,
        opacity: overlayOpacity
      });
    }

    if (text) {
      allTextOverlays.push({
        text,
        x,
        y,
        fontSize,
        color
      });
    }

    if (allImageOverlays.length === 0 && allTextOverlays.length === 0) {
      return NextResponse.json({ error: 'At least one overlay (image or text) is required' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const baseImagePath = path.join(publicDir, 'base-image.jpg');

    // Check if base image exists
    if (!fs.existsSync(baseImagePath)) {
      return NextResponse.json({ error: 'Base image not found' }, { status: 404 });
    }

    // Build command arguments array
    const args = [baseImagePath];

    // Process image overlays
    for (const overlay of allImageOverlays) {
      const overlayImagePath = path.join(publicDir, overlay.image);
      
      // Check if overlay image exists
      if (!fs.existsSync(overlayImagePath)) {
        return NextResponse.json({ error: `Overlay image not found: ${overlay.image}` }, { status: 404 });
      }

      // Open parenthesis for overlay processing
      args.push('(');
      args.push(overlayImagePath);
      
      // Resize overlay if dimensions are provided
      if (overlay.width || overlay.height) {
        const resize = overlay.width && overlay.height 
          ? `${overlay.width}x${overlay.height}!` 
          : overlay.width 
          ? `${overlay.width}x` 
          : `x${overlay.height}`;
        args.push('-resize', resize);
      }
      
      // Rotate overlay if rotation is provided
      if (overlay.rotation && overlay.rotation !== 0) {
        args.push('-rotate', overlay.rotation.toString());
      }
      
      // Set opacity if not 100%
      if (overlay.opacity && overlay.opacity !== 100) {
        args.push('-alpha', 'set', '-channel', 'A', '-evaluate', 'multiply', (overlay.opacity/100).toString());
      }

      // Close parenthesis
      args.push(')');
      
      // Apply gravity if specified
      if (overlay.gravity) {
        args.push('-gravity', overlay.gravity);
        args.push('-composite');
      } else {
        // Use geometry for precise positioning
        const xPos = overlay.x || 0;
        const yPos = overlay.y || 0;
        args.push('-geometry', `+${xPos}+${yPos}`, '-composite');
      }
    }

    // Process text overlays
    for (const textOverlay of allTextOverlays) {
      if (textOverlay.arcDistort && textOverlay.arcDistort !== 0) {
        // For arc distorted text, we need to create the text on a temporary layer first
        // then apply the distortion, then composite it
        args.push('(');
        args.push('-background', 'transparent');
        args.push('-size', '800x200'); // Temporary canvas size for text
        
        // Set font properties
        if (textOverlay.fontFamily) {
          args.push('-font', textOverlay.fontFamily);
        }
        const textFontSize = textOverlay.fontSize || 48;
        args.push('-pointsize', textFontSize.toString());
        
        // Set text color
        const textColor = textOverlay.color || 'black';
        args.push('-fill', textColor);
        
        // Set stroke if provided
        if (textOverlay.strokeColor && textOverlay.strokeWidth) {
          args.push('-stroke', textOverlay.strokeColor);
          args.push('-strokewidth', textOverlay.strokeWidth.toString());
        }
        
        // Set background color if provided
        if (textOverlay.backgroundColor) {
          args.push('-undercolor', textOverlay.backgroundColor);
        }
        
        // Create text label
        args.push('label:' + textOverlay.text);
        
        // Apply arc distortion
        args.push('-distort', 'Arc', textOverlay.arcDistort.toString());
        
        args.push(')');
        
        // Composite the distorted text onto the main image
        if (textOverlay.gravity) {
          args.push('-gravity', textOverlay.gravity);
        } else {
          args.push('-gravity', 'northwest');
        }
        
        const xPos = textOverlay.x || 0;
        const yPos = textOverlay.y || 0;
        args.push('-geometry', `+${xPos}+${yPos}`);
        args.push('-composite');
        
      } else {
        // Regular text overlay without distortion
        // Set font family if provided
        if (textOverlay.fontFamily) {
          args.push('-font', textOverlay.fontFamily);
        }
        
        // Set font size
        const textFontSize = textOverlay.fontSize || 48;
        args.push('-pointsize', textFontSize.toString());
        
        // Set text color
        const textColor = textOverlay.color || 'black';
        args.push('-fill', textColor);
        
        // Set stroke if provided
        if (textOverlay.strokeColor && textOverlay.strokeWidth) {
          args.push('-stroke', textOverlay.strokeColor);
          args.push('-strokewidth', textOverlay.strokeWidth.toString());
        }
        
        // Set background color if provided
        if (textOverlay.backgroundColor) {
          args.push('-undercolor', textOverlay.backgroundColor);
        }
        
        // Apply gravity and positioning
        if (textOverlay.gravity) {
          args.push('-gravity', textOverlay.gravity);
          const xOffset = textOverlay.x || 0;
          const yOffset = textOverlay.y || 0;
          args.push('-annotate', `+${xOffset}+${yOffset}`, textOverlay.text);
        } else {
          args.push('-gravity', 'northwest');
          const xPos = textOverlay.x || 0;
          const yPos = textOverlay.y || 0;
          args.push('-annotate', `+${xPos}+${yPos}`, textOverlay.text);
        }
      }
    }

    // Resize to specified output dimensions
    args.push('-resize', `${outputWidth}x${outputHeight}!`);

    // Output format
    const format = outputFormat.toLowerCase() === 'png' ? 'png:-' : 'jpg:-';
    args.push(format);

    // Build the final command
    const command = `convert ${args.map(arg => `"${arg}"`).join(' ')}`;

    // Execute ImageMagick command and capture binary output
    const { stdout } = await execAsync(command, { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer

    // Determine content type
    const contentType = outputFormat.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

    // Return the image as binary response
    return new NextResponse(stdout, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
