import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing End-to-End API Integration...');

async function testApiIntegration() {
  try {
    // Check if server is running
    console.log('\n1. 📡 Testing server connectivity...');
    const healthResponse = await fetch('http://localhost:3001');
    if (!healthResponse.ok) {
      throw new Error('Development server is not running. Please start with: npm run dev');
    }
    console.log('✅ Server is running on http://localhost:3001');

    // Create test image data (small base64 test image)
    console.log('\n2. 🖼️  Creating test image data...');
    
    // Create a minimal test image as a blob
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    
    // Since we're in Node.js, we'll create form data with a simple image buffer
    // For testing, we'll use a placeholder approach
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    const testBlob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('image', testBlob, 'test.png');
    formData.append('prompt', 'make the image more colorful and vibrant');

    console.log('✅ Test image data prepared');

    // Test API endpoint
    console.log('\n3. 🚀 Testing /api/image-edit endpoint...');
    console.log('   - Sending request to http://localhost:3001/api/image-edit');
    console.log('   - Prompt: "make the image more colorful and vibrant"');
    
    const apiResponse = await fetch('http://localhost:3001/api/image-edit', {
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
    console.log('   - Images count:', result.data?.images?.length || 0);
    console.log('   - First image URL:', result.data?.images?.[0]?.url || 'None');
    console.log('   - Description:', result.data?.description || 'None');
    console.log('   - Request ID:', result.data?.requestId || 'None');
    console.log('   - Original filename:', result.data?.originalFileName || 'None');

    // Validate response structure
    console.log('\n4. ✔️  Validating response structure...');
    
    if (!result.success) {
      throw new Error('API returned success: false');
    }
    
    if (!result.data?.images || result.data.images.length === 0) {
      throw new Error('No edited images in response');
    }
    
    if (!result.data.images[0].url) {
      throw new Error('No URL in first image');
    }
    
    console.log('✅ Response structure is valid');

    // Test edited image accessibility
    console.log('\n5. 🌐 Testing edited image accessibility...');
    const imageUrl = result.data.images[0].url;
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.warn('⚠️  Warning: Edited image URL not accessible:', imageResponse.status);
    } else {
      const imageSize = imageResponse.headers.get('content-length');
      console.log('✅ Edited image is accessible, size:', imageSize ? `${imageSize} bytes` : 'unknown');
    }

    return result;

  } catch (error) {
    console.error('\n❌ Integration Test Failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('server is not running')) {
      console.log('\n💡 To fix this issue:');
      console.log('   1. Open a new terminal');
      console.log('   2. Navigate to your project: cd nano-banana-app');
      console.log('   3. Start the development server: npm run dev');
      console.log('   4. Wait for "Ready" message');
      console.log('   5. Run this test again');
    }
    
    throw error;
  }
}

// Run the test
testApiIntegration()
  .then(() => {
    console.log('\n🎉 End-to-End Integration Test PASSED!');
    console.log('✅ Fal AI integration is working correctly');
    console.log('✅ API endpoint is functioning');
    console.log('✅ Image processing pipeline is operational');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 End-to-End Integration Test FAILED!');
    console.log('❌ Check the error details above');
    process.exit(1);
  });