# Image Text Generator

A Next.js application that adds text overlay to images using ImageMagick.

## Features

- Add custom text to a base image
- Add overlay images with full control over:
  - Position (X, Y coordinates)
  - Size (width, height in pixels)
  - Rotation (0-360 degrees)
  - Opacity (0-100%)
- Customize text properties:
  - Font size (12-200px)
  - Color (8 predefined colors)
  - X and Y offset positioning
- Real-time image generation using ImageMagick
- Responsive web interface
- Download generated images

## Prerequisites

- Node.js 18+ 
- ImageMagick installed on the system
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Ensure ImageMagick is installed:
```bash
# On Ubuntu/Debian
sudo apt-get install imagemagick

# On macOS
brew install imagemagick

# Verify installation
which convert
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 (or the port shown in terminal) in your browser

3. Use the interface to:
   - Enter text to overlay on the image
   - Adjust font size, color, and positioning
   - Select an overlay image and adjust its properties
   - Click "Generate Image" to create the result
   - Download the generated image

## API Endpoints

### POST /api/generate-image

Generates an image with text overlay.

**Request Body:**
```json
{
  "text": "Your text here",
  "fontSize": 48,
  "color": "black",
  "x": 0,
  "y": 0,
  "overlayImage": "overlay-circle.png",
  "overlayX": 100,
  "overlayY": 50,
  "overlayWidth": 150,
  "overlayHeight": 150,
  "overlayRotation": 45,
  "overlayOpacity": 80
}
```

**Parameters:**
- `text` (optional): Text to overlay on the image
- `fontSize`, `color`, `x`, `y`: Text styling options
- `overlayImage` (optional): Filename of overlay image in public directory
- `overlayX`, `overlayY`: Position of overlay image
- `overlayWidth`, `overlayHeight` (optional): Resize overlay image
- `overlayRotation`: Rotation in degrees (0-360)
- `overlayOpacity`: Opacity percentage (0-100)

**Response:**
Binary image data (JPEG format) with appropriate headers:
```
Content-Type: image/jpeg
Cache-Control: no-cache, no-store, must-revalidate
```

## Project Structure

- `src/app/api/generate-image/route.ts` - API endpoint for in-memory image generation
- `src/app/components/ImageGenerator.tsx` - React component for the UI with blob URL handling
- `src/app/page.tsx` - Main page component
- `public/base-image.jpg` - Base image for text overlay

## How It Works

1. The frontend collects user input for text and overlay image options
2. A POST request is sent to `/api/generate-image` with the parameters
3. The API uses ImageMagick's `convert` command to:
   - Load the base image
   - Apply overlay image transformations (resize, rotate, opacity)
   - Composite the overlay image at specified coordinates
   - Add text overlay if provided
   - Output the result directly to stdout
4. The API returns the generated image as a binary response (JPEG)
5. The frontend creates a blob URL from the binary data and displays it
6. Users can download the generated image directly from the browser

## Benefits of the Current Approach

- **No file system clutter**: Images are generated in memory and streamed directly to the client
- **Better performance**: No disk I/O for temporary files
- **Automatic cleanup**: Blob URLs are properly cleaned up to prevent memory leaks
- **Direct download**: Users can download images without server-side file management

## Technologies Used

- **Next.js 15** - React framework with API routes
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **ImageMagick** - Command-line image manipulation tool
- **Node.js child_process** - Execute ImageMagick commands from Node.js
