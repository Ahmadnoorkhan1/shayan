const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY
});

// Create directory for onboarding images
const ONBOARDING_DIR = path.join(__dirname, '../public/images/onboarding');

// Define the image prompts for the onboarding flow
const onboardingPrompts = [
  {
    name: 'user_role',
    description: 'User Role Selection',
    prompt: 'A professional, clean illustration showing different educational roles including teacher, content creator, and administrator. Minimalist style with soft blue and green color palette, perfect for an educational platform onboarding flow. Include subtle icons representing each role. Modern, professional design.'
  },
  {
    name: 'content_type',
    description: 'Content Type Preference',
    prompt: 'A clean, modern illustration showing different educational content types: courses, books, and quick lessons. Minimalist design with soft educational colors. Show iconic representations of digital content with subtle educational symbols. Professional, suitable for a technology platform onboarding step.'
  },
  {
    name: 'organization_size',
    description: 'Organization Size',
    prompt: 'A professional illustration depicting different organization sizes from individual to enterprise. Modern, clean design showing small, medium, and large company representations with minimal people icons. Soft colors with blue and green tones, perfect for an educational technology platform onboarding.'
  },
  {
    name: 'experience_level',
    description: 'Experience Level',
    prompt: 'A clean, modern illustration showing different levels of experience from beginner to expert. Minimalist design with a subtle progress/growth concept. Soft educational colors, abstract skill level visualization. Professional style suitable for an educational platform onboarding flow.'
  },
  {
    name: 'learning_goals',
    description: 'Learning Goals',
    prompt: 'A professional illustration depicting various learning goals and outcomes. Modern design with icons representing skill development, certification, and knowledge acquisition. Clean, minimalist style with soft educational colors. Perfect for an educational platform onboarding flow.'
  },
  {
    name: 'personalization',
    description: 'Personalization Preferences',
    prompt: 'A clean, modern illustration showing content personalization and preferences. Minimalist design with icons representing customized learning paths and content recommendations. Soft blue and green palette with abstract representation of user-centered design. Professional style for educational platform onboarding.'
  }
];

/**
 * Generate and save onboarding images
 */
async function generateOnboardingImages() {
  try {
    // Create directory if it doesn't exist
    await fs.ensureDir(ONBOARDING_DIR);
    console.log(`Directory created: ${ONBOARDING_DIR}`);
    
    const metadata = {
      images: [],
      generatedAt: new Date().toISOString()
    };
    
    console.log(`Generating ${onboardingPrompts.length} onboarding images...`);
    
    // Process each prompt
    for (let i = 0; i < onboardingPrompts.length; i++) {
      const promptData = onboardingPrompts[i];
      console.log(`\nGenerating image ${i+1}/${onboardingPrompts.length}: ${promptData.name}`);
      console.log(`Description: ${promptData.description}`);
      
      try {
        // Generate image
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: promptData.prompt + " Ensure the image is suitable for a professional educational platform without any text overlay.",
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        });
        
        if (!response?.data?.[0]?.b64_json) {
          throw new Error("Invalid API response structure");
        }
        
        // Get image data and save it
        const imageData = response.data[0].b64_json;
        const filename = `onboarding_${promptData.name}.png`;
        const filepath = path.join(ONBOARDING_DIR, filename);
        
        await fs.writeFile(filepath, imageData, { encoding: 'base64' });
        
        // Add to metadata
        metadata.images.push({
          id: i + 1,
          name: promptData.name,
          description: promptData.description,
          filename: filename,
          path: `/images/onboarding/${filename}`,
          prompt: promptData.prompt,
          createdAt: new Date().toISOString()
        });
        
        console.log(`Image saved: ${filepath}`);
        
        // Add delay between API calls to avoid rate limiting
        if (i < onboardingPrompts.length - 1) {
          console.log("Waiting 3 seconds before next request...");
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Error generating image: ${error.message}`);
        
        if (error.response) {
          console.error("API Error details:", error.response.data);
        }
      }
    }
    
    // Save metadata file
    const metadataPath = path.join(ONBOARDING_DIR, 'metadata.json');
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    console.log(`\nMetadata saved to: ${metadataPath}`);
    
    // Summary
    const successCount = metadata.images.length;
    console.log(`\n✅ Successfully generated ${successCount}/${onboardingPrompts.length} onboarding images`);
    console.log(`Images are available at: ${ONBOARDING_DIR}`);
    
  } catch (error) {
    console.error("Error in image generation process:", error);
  }
}

// Execute the function
generateOnboardingImages();