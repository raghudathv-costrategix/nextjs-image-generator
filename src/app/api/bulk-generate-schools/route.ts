import { NextRequest, NextResponse } from 'next/server';

// Random school data generator
interface SchoolData {
  id: number;
  schoolName: string;
  schoolNickName: string;
  schoolMascot: string;
  schoolYear: number;
  schoolDarkColor: string;
  schoolOtherColor: string;
  schoolMascotImage: string;
}

// Sample school names and mascots
const schoolNames = [
  'Lincoln High School', 'Washington Academy', 'Roosevelt Institute', 'Jefferson College',
  'Madison University', 'Monroe Technical', 'Adams Preparatory', 'Jackson Institute',
  'Van Buren Academy', 'Harrison College', 'Tyler University', 'Polk Technical',
  'Taylor High School', 'Fillmore Academy', 'Pierce Institute', 'Buchanan College',
  'Lincoln Academy', 'Johnson University', 'Grant Technical', 'Hayes Preparatory',
  'Garfield Institute', 'Cleveland College', 'McKinley University', 'Roosevelt Technical',
  'Taft High School', 'Wilson Academy', 'Harding Institute', 'Coolidge College',
  'Hoover University', 'Truman Technical', 'Eisenhower Preparatory', 'Kennedy Institute',
  'Johnson College', 'Nixon University', 'Ford Technical', 'Carter High School',
  'Reagan Academy', 'Bush Institute', 'Clinton College', 'Obama University',
  'Central High School', 'North Academy', 'South Institute', 'East College',
  'West University', 'Riverside Technical', 'Hillside Preparatory', 'Valley Institute',
  'Mountain College', 'Lakeside University', 'Oceanview Technical', 'Sunset High School'
];

const mascots = [
  'Eagles', 'Lions', 'Tigers', 'Bears', 'Wolves', 'Hawks', 'Falcons', 'Panthers',
  'Bulldogs', 'Wildcats', 'Mustangs', 'Stallions', 'Knights', 'Warriors', 'Spartans',
  'Titans', 'Giants', 'Dragons', 'Phoenix', 'Thunder', 'Lightning', 'Storm',
  'Hurricanes', 'Tornadoes', 'Blazers', 'Flames', 'Rockets', 'Comets', 'Stars',
  'Meteors', 'Sharks', 'Dolphins', 'Whales', 'Rams', 'Bulls', 'Bison', 'Broncos',
  'Colts', 'Jaguars', 'Leopards', 'Cougars', 'Bobcats', 'Lynx', 'Foxes', 'Hounds',
  'Wolves', 'Coyotes', 'Badgers', 'Wolverines', 'Grizzlies', 'Cardinals', 'Ravens'
];

const darkColors = [
  '#1a1a1a', '#2c3e50', '#34495e', '#7f8c8d', '#16a085', '#27ae60',
  '#2980b9', '#8e44ad', '#2c3e50', '#f39c12', '#e67e22', '#e74c3c',
  '#9b59b6', '#3498db', '#1abc9c', '#f1c40f', '#e67e22', '#e74c3c'
];

const otherColors = [
  '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#f39c12', '#e67e22',
  '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#3498db', '#2980b9',
  '#1abc9c', '#16a085', '#27ae60', '#229954', '#f1c40f', '#f39c12'
];

const mascotImages = [
  'overlay-circle.png', 'overlay-triangle.png', 'overlay-text.png'
];

// Generate random school data
function generateRandomSchoolData(count: number): SchoolData[] {
  const schools: SchoolData[] = [];
  
  for (let i = 1; i <= count; i++) {
    const schoolName = schoolNames[Math.floor(Math.random() * schoolNames.length)];
    const mascot = mascots[Math.floor(Math.random() * mascots.length)];
    
    schools.push({
      id: i,
      schoolName,
      schoolNickName: schoolName.split(' ')[0], // First word as nickname
      schoolMascot: mascot,
      schoolYear: 1900 + Math.floor(Math.random() * 125), // Random year between 1900-2025
      schoolDarkColor: darkColors[Math.floor(Math.random() * darkColors.length)],
      schoolOtherColor: otherColors[Math.floor(Math.random() * otherColors.length)],
      schoolMascotImage: mascotImages[Math.floor(Math.random() * mascotImages.length)]
    });
  }
  
  return schools;
}

// Generate images for all school data
async function generateImagesForSchools(schools: SchoolData[], templateName: string, baseUrl: string) {
  const results = [];
  
  for (const school of schools) {
    try {
      // Create template data for this school
      const templateData = {
        SCHOOL_NAME: school.schoolName,
        SCHOOL_NICK_NAME: school.schoolNickName,
        SCHOOL_MASCOT: school.schoolMascot,
        SCHOOL_YEAR: school.schoolYear.toString(),
        SCHOOL_DARK_COLOR: school.schoolDarkColor,
        SCHOOL_OTHER_COLOR: school.schoolOtherColor,
        SCHOOL_MASCOT_IMAGE: school.schoolMascotImage
      };

      // Call the generate-from-template API using the same base URL
      const response = await fetch(new URL('/api/generate-from-template', baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateFile: templateName,
          templateData: templateData
        })
      });

      if (response.ok) {
        // Convert image to base64 for browser display
        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        results.push({
          schoolId: school.id,
          schoolName: school.schoolName,
          status: 'success',
          imageUrl: imageDataUrl, // Base64 data URL instead of file path
          mascot: school.schoolMascot,
          year: school.schoolYear,
          colors: {
            dark: school.schoolDarkColor,
            other: school.schoolOtherColor
          }
        });
      } else {
        const errorText = await response.text();
        results.push({
          schoolId: school.id,
          schoolName: school.schoolName,
          status: 'error',
          error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        });
      }
    } catch (error) {
      results.push({
        schoolId: school.id,
        schoolName: school.schoolName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 100, template = '10_light.xml' } = body;

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Generate random school data
    const schools = generateRandomSchoolData(count);
    
    // Generate images for all schools
    const results = await generateImagesForSchools(schools, template, baseUrl);
    
    // Calculate statistics
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    return NextResponse.json({
      success: true,
      message: `Generated images for ${count} schools using template ${template}`,
      statistics: {
        total: count,
        successful,
        failed,
        successRate: `${((successful / count) * 100).toFixed(1)}%`
      },
      results,
      schoolData: schools
    });
    
  } catch (error) {
    console.error('Bulk generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Bulk School Image Generator API',
    usage: 'POST with { count: number, template: string }',
    availableTemplates: ['10_light.xml', '11_light.xml', '12_light.xml'],
    defaultCount: 100,
    defaultTemplate: '10_light.xml'
  });
}
