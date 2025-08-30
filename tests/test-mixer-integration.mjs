#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/mixer-edit`;

// Test image paths
const TEST_IMAGES = [
  path.join(__dirname, 'testing-assets', 'formula-1.png'),
  path.join(__dirname, 'testing-assets', 'watch.png')
];

// Available models for testing
const MODELS = [
  'fal-ai/nano-banana/edit',
  'google/gemini-2.5-flash-image-preview:free'
];

// Test prompts
const TEST_PROMPTS = [
  "Make the driver to wear the watch",
  "Analyze both images and describe what you see",
  "Combine elements from both images creatively",
  "Add sunglasses to any people in the images"
];

console.log('🚀 Starting Editor Mixer Integration Tests');
console.log('='.repeat(50));
console.log(`Testing endpoint: ${API_ENDPOINT}`);
console.log(`Available test images: ${TEST_IMAGES.length}`);
console.log(`Testing models: ${MODELS.join(', ')}`);
console.log('='.repeat(50));

async function validateTestImages() {
  console.log('📋 Validating test images...');
  
  const validImages = [];
  
  for (const imagePath of TEST_IMAGES) {
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ ${path.basename(imagePath)} (${sizeMB} MB)`);
      validImages.push(imagePath);
    } else {
      console.log(`❌ Missing: ${path.basename(imagePath)}`);
    }
  }
  
  if (validImages.length === 0) {
    console.log('❌ No test images found! Please add test images to tests/testing-assets/');
    process.exit(1);
  }
  
  console.log(`✅ Found ${validImages.length} valid test images\n`);
  return validImages;
}

async function createFormData(prompt, model, imagePaths) {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('model', model);
  
  // Add images with indexed names as expected by the API
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    const filename = path.basename(imagePath);
    
    // Create a File-like object
    const file = new File([imageBlob], filename, { type: 'image/png' });
    formData.append(`image_${i}`, file);
  }
  
  return formData;
}

async function testMixerAPI(prompt, model, imagePaths) {
  console.log(`🧪 Testing: ${model}`);
  console.log(`📝 Prompt: "${prompt}"`);
  console.log(`🖼️ Images: ${imagePaths.map(p => path.basename(p)).join(', ')}`);
  
  try {
    const formData = await createFormData(prompt, model, imagePaths);
    
    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`📥 Response received in ${duration}s`);
    console.log(`🌐 HTTP Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    console.log('📊 Response Analysis:');
    console.log(`├─ Success: ${result.success ? '✅' : '❌'}`);
    
    if (result.success && result.data) {
      console.log(`├─ Provider: ${result.data.provider?.toUpperCase() || 'Unknown'}`);
      console.log(`├─ Model: ${result.data.model || 'Unknown'}`);
      console.log(`├─ Response ID: ${result.data.id || 'Unknown'}`);
      console.log(`├─ Content Length: ${result.data.content?.length || 0} chars`);
      console.log(`├─ Has Images: ${result.data.hasImages ? '✅' : '❌'}`);
      console.log(`├─ Generated Images: ${result.data.images?.length || 0}`);
      console.log(`├─ Images Processed: ${result.data.originalFileNames?.length || 0}`);
      
      if (result.data.finishReason) {
        console.log(`├─ Finish Reason: ${result.data.finishReason}`);
      }
      
      if (result.data.usage) {
        console.log(`└─ Token Usage: ${result.data.usage.total_tokens || 'Unknown'} total`);
      }
      
      // Display content preview
      if (result.data.content) {
        const preview = result.data.content.length > 200 
          ? result.data.content.substring(0, 200) + '...'
          : result.data.content;
        console.log(`\n💬 AI Response Preview:`);
        console.log(`"${preview}"`);
      }
      
      // Display generated images info
      if (result.data.hasImages && result.data.images?.length) {
        console.log(`\n🖼️ Generated Images:`);
        result.data.images.forEach((img, idx) => {
          console.log(`├─ Image ${idx + 1}:`);
          if (img.url) {
            console.log(`│  ├─ URL: ${img.url.substring(0, 100)}...`);
          }
          if (img.b64_json) {
            console.log(`│  ├─ Base64: ${img.b64_json.length} chars`);
          }
          if (img.revised_prompt) {
            console.log(`│  └─ Revised Prompt: ${img.revised_prompt}`);
          }
        });
      }
      
    } else if (result.error) {
      console.log(`├─ Error Type: ${result.error.type}`);
      console.log(`├─ Error Title: ${result.error.title}`);
      console.log(`├─ Error Message: ${result.error.message}`);
      console.log(`├─ Error Code: ${result.error.code}`);
      console.log(`├─ Retryable: ${result.error.retryable ? '✅' : '❌'}`);
      console.log(`└─ HTTP Status: ${result.error.httpStatus}`);
      
      if (result.error.details && result.error.details !== result.error.message) {
        console.log(`\n🔍 Error Details:`);
        console.log(result.error.details);
      }
    }
    
    return { success: result.success, duration, response: result };
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return { success: false, duration: 0, error: error.message };
  }
}

async function runComprehensiveTests() {
  const validImages = await validateTestImages();
  
  // Test results tracking
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  
  console.log('🧪 Starting comprehensive tests...\n');
  
  // Test 1: Single image with each model
  console.log('📋 TEST SET 1: Single Image Processing');
  console.log('-'.repeat(40));
  
  for (const model of MODELS) {
    totalTests++;
    const testResult = await testMixerAPI(
      "Describe what you see in this image in detail",
      model,
      [validImages[0]] // Use first image only
    );
    
    if (testResult.success) passedTests++;
    results.push({ test: `Single image - ${model}`, ...testResult });
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test 2: Multi-image with specific prompt
  console.log('📋 TEST SET 2: Multi-Image Processing');
  console.log('-'.repeat(40));
  
  const multiImagePrompt = "Make the driver to wear the watch";
  
  for (const model of MODELS) {
    totalTests++;
    const testResult = await testMixerAPI(
      multiImagePrompt,
      model,
      validImages // Use all available images
    );
    
    if (testResult.success) passedTests++;
    results.push({ test: `Multi-image: "${multiImagePrompt}" - ${model}`, ...testResult });
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test 3: Different prompts with multi-image
  console.log('📋 TEST SET 3: Different Prompts');
  console.log('-'.repeat(40));
  
  for (const prompt of TEST_PROMPTS.slice(1, 3)) { // Test 2 different prompts
    totalTests++;
    const testResult = await testMixerAPI(
      prompt,
      MODELS[0], // Use first model
      validImages
    );
    
    if (testResult.success) passedTests++;
    results.push({ test: `"${prompt}" - ${MODELS[0]}`, ...testResult });
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test 4: Error handling tests
  console.log('📋 TEST SET 4: Error Handling');
  console.log('-'.repeat(40));
  
  // Test empty prompt
  totalTests++;
  console.log('🧪 Testing empty prompt...');
  try {
    const formData = new FormData();
    formData.append('prompt', '');
    formData.append('model', MODELS[0]);
    formData.append('image_0', new File([new Blob(['fake']), 'test.png'], 'test.png', { type: 'image/png' }));
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log(`✅ Empty prompt validation: ${result.error?.code === 'NO_PROMPT' ? 'PASSED' : 'FAILED'}`);
    if (result.success) passedTests++;
    results.push({ test: 'Empty prompt validation', success: !result.success, error: result.error?.message });
  } catch (error) {
    console.log(`❌ Empty prompt test failed: ${error.message}`);
    results.push({ test: 'Empty prompt validation', success: false, error: error.message });
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: No images test
  totalTests++;
  console.log('🧪 Testing no images...');
  try {
    const formData = new FormData();
    formData.append('prompt', 'Test prompt');
    formData.append('model', MODELS[0]);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log(`✅ No images validation: ${result.error?.code === 'NO_IMAGES' ? 'PASSED' : 'FAILED'}`);
    if (result.success) passedTests++;
    results.push({ test: 'No images validation', success: !result.success, error: result.error?.message });
  } catch (error) {
    console.log(`❌ No images test failed: ${error.message}`);
    results.push({ test: 'No images validation', success: false, error: error.message });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\n📈 Overall Results:`);
  console.log(`├─ Total Tests: ${totalTests}`);
  console.log(`├─ Passed: ${passedTests}`);
  console.log(`├─ Failed: ${totalTests - passedTests}`);
  console.log(`└─ Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 Detailed Results:`);
  results.forEach((result, idx) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? `(${result.duration}s)` : '';
    console.log(`${idx + 1}. ${status} ${result.test} ${duration}`);
    
    if (!result.success && result.error) {
      console.log(`   └─ Error: ${result.error}`);
    }
  });
  
  // Performance summary
  const successfulTests = results.filter(r => r.success && r.duration);
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + parseFloat(r.duration), 0) / successfulTests.length;
    const maxDuration = Math.max(...successfulTests.map(r => parseFloat(r.duration)));
    const minDuration = Math.min(...successfulTests.map(r => parseFloat(r.duration)));
    
    console.log(`\n⏱️ Performance Summary:`);
    console.log(`├─ Average Response Time: ${avgDuration.toFixed(2)}s`);
    console.log(`├─ Fastest Response: ${minDuration.toFixed(2)}s`);
    console.log(`└─ Slowest Response: ${maxDuration.toFixed(2)}s`);
  }
  
  console.log('\n🎯 Recommendation:');
  if (passedTests === totalTests) {
    console.log('✅ All tests passed! The Editor Mixer is ready for production.');
  } else if (passedTests / totalTests >= 0.8) {
    console.log('⚠️ Most tests passed. Review failed tests and consider fixes.');
  } else {
    console.log('❌ Many tests failed. Significant issues need to be addressed.');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Editor Mixer Integration Testing Complete!');
  console.log('='.repeat(70));
}

// Add error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runComprehensiveTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});