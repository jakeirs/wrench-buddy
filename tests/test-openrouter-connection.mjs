import OpenAI from 'openai';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Configure OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Site URL for rankings
    "X-Title": "Nano Banana App", // Site title for rankings
  },
});

console.log('🚀 Testing OpenRouter Connection...');
console.log('OPENROUTER_API_KEY configured:', !!process.env.OPENROUTER_API_KEY);

async function testOpenRouterConnection() {
  try {
    console.log('\n📡 Making API call to OpenRouter with Gemini 2.5 Flash...');
    
    // Read the test image and convert to base64
    const imagePath = path.join(process.cwd(), 'tests', 'testing-assets', 'formula-1.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('📸 Using test image:', imagePath);
    console.log('🏎️ Test prompt: "Generate a modified version of this image"');
    
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview:free",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Generate a modified version of this image with the car painted red. Return the edited image."
            },
            {
              "type": "image_url",
              "image_url": {
                "url": dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    console.log('\n✅ API Response received:');
    console.log('- Model used:', completion.model);
    console.log('- Response ID:', completion.id);
    console.log('- Finish reason:', completion.choices[0].finish_reason);
    console.log('- Content length:', completion.choices[0].message.content?.length || 0);
    console.log('- Content preview:', completion.choices[0].message.content?.substring(0, 200) + '...');
    
    if (completion.usage) {
      console.log('- Prompt tokens:', completion.usage.prompt_tokens);
      console.log('- Completion tokens:', completion.usage.completion_tokens);
      console.log('- Total tokens:', completion.usage.total_tokens);
    }
    
    return completion;
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
    throw error;
  }
}

testOpenRouterConnection()
  .then(() => {
    console.log('\n🎉 Connection test successful! OpenRouter integration is working.');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Connection test failed. Check the error details above.');
    process.exit(1);
  });