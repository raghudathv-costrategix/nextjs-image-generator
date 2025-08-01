# Template-Based Multi-Layered Image Generation

This feature allows you to generate complex multi-layered images using XML templates that define the positioning, styling, and content of various text and image layers.

## Features

- **XML Template Parsing**: Automatically parses XML template files to extract layer information
- **Multi-Layer Support**: Handles both text and image overlays with precise positioning
- **Template Data Substitution**: Replace template variables with actual values
- **Advanced Text Effects**: Support for arc distortion, rotation, gravity positioning
- **Batch Processing**: Generate multiple variations from the same template
- **Multiple Output Formats**: Support for JPEG and PNG output

## API Endpoints

### 1. Generate Single Image from Template

**POST** `/api/generate-from-template`

Generate a single image using a specific template and custom data.

#### Request Body:
```json
{
  "templateFile": "10_light.xml",
  "templateData": {
    "SCHOOL_NICK_NAME": "EAGLES",
    "SCHOOL_NAME": "RIVERSIDE HIGH SCHOOL",
    "SCHOOL_MASCOT": "EAGLES",
    "SCHOOL_YEAR": "1985",
    "SCHOOL_INITIAL": "R",
    "SCHOOL_MASCOT_WITH_ARTICLE": "THE EAGLES",
    "SCHOOL_DARK_COLOR": "#003366",
    "SCHOOL_OTHER_COLOR": "#FFD700",
    "SCHOOL_MASCOT_IMAGE": "overlay-circle.png"
  },
  "outputWidth": 800,
  "outputHeight": 600,
  "outputFormat": "jpg"
}
```

#### Response:
Binary image data (JPEG or PNG)

### 2. Process All Templates

**GET** `/api/generate-from-template`

Process all available templates and return their layer information without generating images.

#### Query Parameters:
- `format`: Output format (jpg/png)
- `width`: Output width in pixels
- `height`: Output height in pixels

#### Response:
```json
{
  "success": true,
  "processedTemplates": 3,
  "results": [
    {
      "template": "10_light.xml",
      "templateName": "Vertical 1",
      "templateId": "10",
      "success": true,
      "layersProcessed": 4,
      "imageOverlays": 1,
      "textOverlays": 3,
      "overlays": {
        "imageOverlays": [...],
        "textOverlays": [...]
      }
    }
  ]
}
```

## Template Structure

Templates are XML files located in the `/templates` directory. Each template defines:

### Template Root
```xml
<template date="" Author="" version="2" engine="generic" name="Template Name" id="10">
```

### Layer Types

#### Text Layer
```xml
<layer>
  <type>TEXT</type>
  <sequence>1</sequence>
  <text>SCHOOL_NICK_NAME</text>
  <font>CollegiateInsideFLF.ttf</font>
  <color>SCHOOL_OTHER_COLOR</color>
  <position>
    <x>0.5</x>
    <y>8.571428571</y>
  </position>
  <size>
    <width>114</width>
    <height>15.952380952</height>
  </size>
  <rotation>90</rotation>
  <gravity>NorthEast</gravity>
  <arc>-distort Arc 15</arc>
</layer>
```

#### Image Layer
```xml
<layer>
  <type>IMAGE</type>
  <sequence>2</sequence>
  <path>SCHOOL_MASCOT_IMAGE</path>
  <position>
    <x>10</x>
    <y>8.571428571</y>
  </position>
  <size>
    <width>40</width>
    <height>31.571428571</height>
  </size>
  <gravity>NorthEast</gravity>
</layer>
```

## Template Data Variables

The following variables can be substituted in templates:

- `SCHOOL_NICK_NAME`: Short school name or nickname
- `SCHOOL_NAME`: Full school name
- `SCHOOL_MASCOT`: School mascot name
- `SCHOOL_YEAR`: Establishment year
- `SCHOOL_INITIAL`: School initial letter
- `SCHOOL_MASCOT_WITH_ARTICLE`: Mascot with article (e.g., "THE EAGLES")
- `SCHOOL_DARK_COLOR`: Primary school color (hex format)
- `SCHOOL_OTHER_COLOR`: Secondary school color (hex format)
- `SCHOOL_MASCOT_IMAGE`: Path to mascot image file

## Available Templates

### 1. Template 10 - Vertical 1 (`10_light.xml`)
- **Layout**: Vertical text layout with rotated elements
- **Layers**: 4 (1 image, 3 text)
- **Features**: Rotated text, gravity positioning

### 2. Template 11 - Swirl (`11_light.xml`)
- **Layout**: Swirl design with centered elements
- **Layers**: 3 (2 images, 1 text)
- **Features**: Multiple image overlays, gravity positioning

### 3. Template 12 - LargeType1 (`12_light.xml`)
- **Layout**: Large typography with arc distortion
- **Layers**: 4 (1 image, 3 text)
- **Features**: Arc distorted text, large typography

## UI Interface

Access the template generator at: `http://localhost:3000/template-generator`

The interface provides:
- Template selection dropdown
- Custom template data input fields
- Output format and dimension controls
- Single template generation
- Batch processing for all templates
- Generated image preview
- Overlay details inspection

## Batch Generation Script

Use the included script to generate multiple variations:

```bash
./generate-all-templates.sh
```

This will create images for all templates with different school data variations in the `generated-images` directory.

## Usage Examples

### Generate Eagles Template
```bash
curl -X POST "http://localhost:3000/api/generate-from-template" \
  -H "Content-Type: application/json" \
  -d '{
    "templateFile": "10_light.xml",
    "templateData": {
      "SCHOOL_NICK_NAME": "EAGLES",
      "SCHOOL_MASCOT_IMAGE": "overlay-circle.png"
    }
  }' \
  --output eagles-image.jpg
```

### Process All Templates
```bash
curl "http://localhost:3000/api/generate-from-template?format=jpg&width=800&height=600"
```

## Technical Details

- **ImageMagick Integration**: Uses ImageMagick for advanced image composition
- **XML Parsing**: xml2js library for template parsing
- **Layer Sequencing**: Layers are processed in sequence order
- **Coordinate System**: Template coordinates are converted to ImageMagick geometry
- **Arc Distortion**: Supports complex text effects including arc distortion
- **Gravity Positioning**: Supports ImageMagick gravity-based positioning

## Error Handling

The system handles various error conditions:
- Missing template files
- Invalid XML format
- Missing overlay images
- ImageMagick command failures
- Network request errors

## Performance Considerations

- Images are generated on-demand
- No caching is implemented (suitable for development)
- Memory usage scales with image dimensions
- Processing time depends on layer complexity
