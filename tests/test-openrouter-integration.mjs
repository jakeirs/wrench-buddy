import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing OpenRouter End-to-End API Integration...');

async function testOpenRouterIntegration() {
  try {
    // Check if server is running
    console.log('\n1. 📡 Testing server connectivity...');
    const healthResponse = await fetch('http://localhost:3002');
    if (!healthResponse.ok) {
      throw new Error('Development server is not running. Please start with: npm run dev');
    }
    console.log('✅ Server is running on http://localhost:3002');

    // Use the actual test image
    console.log('\n2. 🖼️  Loading test image...');
    const imagePath = path.join(__dirname, 'testing-assets', 'formula-1.png');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Test image not found at: ${imagePath}`);
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('✅ Test image loaded:', imagePath);
    console.log('   - Size:', imageBuffer.length, 'bytes');

    // Test with image generation prompt
    const formData = new FormData();
    const testBlob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', testBlob, 'formula-1.png');
    formData.append('prompt', 'Generate a modified version of this image with the car painted red. Return the edited image.');

    console.log('✅ Form data prepared with test prompt: "Generate a modified version of this image with the car painted red. Return the edited image."');

    // Test OpenRouter API endpoint
    console.log('\n3. 🚀 Testing /api/openrouter-edit endpoint...');
    console.log('   - Sending request to http://localhost:3002/api/openrouter-edit');
    console.log('   - Using Gemini 2.5 Flash Image model (free)');
    
    const apiResponse = await fetch('http://localhost:3002/api/openrouter-edit', {
      method: 'POST',
      body: formData,
    });

    console.log('   - Response status:', apiResponse.status);
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('❌ API Error:', errorData);
      throw new Error(`API request failed: ${apiResponse.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await apiResponse.json();
    
    console.log('\n✅ API Response received:');
    console.log('   - Success:', result.success);
    console.log('   - Model used:', result.data?.model || 'Unknown');
    console.log('   - Response ID:', result.data?.id || 'None');
    console.log('   - Content length:', result.data?.content?.length || 0);
    console.log('   - Content preview:', result.data?.content?.substring(0, 200) + '...' || 'None');
    console.log('   - Original filename:', result.data?.originalFileName || 'None');
    
    if (result.data?.usage) {
      console.log('   - Token usage:');
      console.log('     - Prompt tokens:', result.data.usage.prompt_tokens);
      console.log('     - Completion tokens:', result.data.usage.completion_tokens);
      console.log('     - Total tokens:', result.data.usage.total_tokens);
    }

    // Validate response structure
    console.log('\n4. ✔️  Validating response structure...');
    
    if (!result.success) {
      throw new Error('API returned success: false');
    }
    
    console.log('✅ Response structure is valid');
    
    // Check for images in the response
    console.log('\n5. 🖼️ CHECKING FOR IMAGES IN RESPONSE:');
    console.log('Has images property:', !!result.data?.images);
    console.log('Images value:', result.data?.images);
    console.log('Has hasImages flag:', result.data?.hasImages);
    
    if (result.data?.completeMessage) {
      console.log('\n📋 COMPLETE MESSAGE STRUCTURE:');
      console.log(JSON.stringify(result.data.completeMessage, null, 2));
    }

    // Test if content contains relevant information about the request  
    console.log('\n6. 🧠 Testing AI response relevance...');
    const content = (result.data.content || '').toLowerCase();
    
    if (content.includes('red') || content.includes('car') || content.includes('image') || content.includes('generate')) {
      console.log('✅ AI response appears relevant to the prompt');
    } else if (!content) {
      console.log('⚠️  No text content in response - checking for images instead');
    } else {
      console.warn('⚠️  Warning: AI response might not be directly relevant to the prompt');
    }

    return result;

  } catch (error) {
    console.error('\n❌ OpenRouter Integration Test Failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('server is not running')) {
      console.log('\n💡 To fix this issue:');
      console.log('   1. Open a new terminal');
      console.log('   2. Navigate to your project: cd nano-banana-app');
      console.log('   3. Start the development server: npm run dev');
      console.log('   4. Wait for "Ready" message');
      console.log('   5. Run this test again');
    }
    
    if (error.message.includes('404') || error.message.includes('openrouter-edit')) {
      console.log('\n💡 API endpoint not found:');
      console.log('   Make sure the OpenRouter API endpoint (/api/openrouter-edit) is implemented');
    }
    
    throw error;
  }
}

// Run the test
testOpenRouterIntegration()
  .then(() => {
    console.log('\n🎉 OpenRouter End-to-End Integration Test PASSED!');
    console.log('✅ OpenRouter integration is working correctly');
    console.log('✅ API endpoint is functioning');
    console.log('✅ Gemini 2.5 Flash model is responding');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 OpenRouter End-to-End Integration Test FAILED!');
    console.log('❌ Check the error details above');
    process.exit(1);
  });