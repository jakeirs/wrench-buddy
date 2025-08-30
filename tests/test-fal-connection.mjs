import { fal } from '@fal-ai/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

console.log('🚀 Testing Fal AI Connection...');
console.log('FAL_KEY configured:', !!process.env.FAL_KEY);

async function testFalConnection() {
  try {
    console.log('\n📡 Making API call to fal-ai/nano-banana/edit...');
    
    // Using a publicly accessible test image
    const testImageUrl = 'https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png';
    
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: "make the sky more blue and vibrant",
        image_urls: [testImageUrl],
        num_images: 1,
        output_format: "jpeg"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('📝 Processing logs:', update.logs?.map(log => log.message).join(', ') || 'No logs');
        } else {
          console.log('📊 Queue update:', update.status);
        }
      },
    });

    console.log('\n✅ API Response received:');
    console.log('- Images count:', result.data?.images?.length || 0);
    console.log('- Description:', result.data?.description || 'No description');
    console.log('- First image URL:', result.data?.images?.[0]?.url || 'No image URL');
    console.log('- Request ID:', result.requestId);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

testFalConnection()
  .then(() => {
    console.log('\n🎉 Connection test successful! Fal AI integration is working.');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Connection test failed. Check the error details above.');
    process.exit(1);
  });