import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Type definitions for API responses
interface OpenAIMessage {
  role: string;
  content: string | null;
  images?: Array<{
    image_url?: { url?: string };
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

interface OpenAIChoice {
  message: OpenAIMessage;
  finish_reason: string;
  native_finish_reason?: string;
  index: number;
}

interface OpenAIError {
  response?: { 
    data?: {
      error?: {
        message?: string;
        code?: string;
      };
    }; 
    status?: number; 
    headers?: unknown;
    statusText?: string;
  };
  status?: number;
  message?: string;
}

// Configure OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": "Nano Banana App",
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    // Convert file to array buffer then to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log('🚀 Processing OpenRouter image edit request:', {
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      model: 'google/gemini-2.5-flash-image-preview:free'
    });

    console.log('📝 FULL PROMPT TEXT:', {
      prompt: prompt,
      promptLength: prompt.length
    });

    console.log('🖼️ IMAGE PROCESSING DETAILS:', {
      originalSize: file.size,
      mimeType: mimeType,
      base64Length: base64.length,
      dataUrlLength: dataUrl.length,
      dataUrlPreview: dataUrl.substring(0, 100) + '...'
    });

    // Prepare the request payload
    const requestPayload = {
      model: "google/gemini-2.5-flash-image-preview:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    };

    console.log('📤 SENDING TO OPENROUTER:', {
      model: requestPayload.model,
      maxTokens: requestPayload.max_tokens,
      messageCount: requestPayload.messages.length,
      contentItems: requestPayload.messages[0].content.length,
      textContent: requestPayload.messages[0].content[0],
      imageUrlInfo: {
        type: requestPayload.messages[0].content[1].type,
        urlLength: requestPayload.messages[0].content[1].image_url.url.length,
        urlStart: requestPayload.messages[0].content[1].image_url.url.substring(0, 50) + '...'
      },
      requestHeaders: openai.defaultHeaders
    });

    // Call OpenRouter API with Gemini 2.5 Flash (free)
    const completion = await openai.chat.completions.create(requestPayload);

    console.log('📥 OPENROUTER COMPLETE RESPONSE:');
    console.log('Raw Response Object:', JSON.stringify(completion, null, 2));
    
    console.log('📋 RESPONSE SUMMARY:', {
      model: completion.model,
      id: completion.id,
      finishReason: completion.choices[0]?.finish_reason,
      nativeFinishReason: (completion.choices[0] as OpenAIChoice)?.native_finish_reason,
      contentLength: completion.choices[0]?.message?.content?.length || 0,
      choicesCount: completion.choices?.length || 0
    });

    // Check for images in the message
    const responseMessage = completion.choices[0]?.message as OpenAIMessage;
    if (responseMessage && 'images' in responseMessage && responseMessage.images?.length) {
      console.log('🖼️ IMAGES FOUND:', responseMessage.images.length);
      responseMessage.images.forEach((img, index: number) => {
        console.log(`Image ${index}:`, JSON.stringify(img, null, 2));
      });
    }

    console.log('💰 TOKEN USAGE:', completion.usage);
    // Check finish_reason for content filtering or other issues
    const choice = completion.choices[0] as OpenAIChoice;
    const finishReason = choice?.finish_reason;
    const nativeFinishReason = choice?.native_finish_reason;
    
    console.log('🏁 FINISH REASON CHECK:', {
      finish_reason: finishReason,
      native_finish_reason: nativeFinishReason,
      isStop: finishReason === 'stop',
      isContentFilter: finishReason === 'content_filter',
      hasIssue: finishReason !== 'stop'
    });
    
    // Handle non-successful finish reasons
    if (finishReason !== 'stop') {
      let errorTitle = 'Processing Issue';
      let errorMessage = 'The AI model encountered an issue while processing your request';
      let errorCode = 'MODEL_ISSUE';
      let errorType = 'model';
      
      if (finishReason === 'content_filter') {
        errorTitle = 'Content Prohibited';
        errorMessage = nativeFinishReason 
          ? nativeFinishReason.toLowerCase().replace(/_/g, ' ')
          : 'content is prohibited';
        errorCode = 'CONTENT_FILTER';
        errorType = 'content_filter';
      } else if (finishReason === 'length') {
        errorTitle = 'Response Too Long';
        errorMessage = 'The response was truncated due to length limits';
        errorCode = 'LENGTH_LIMIT';
        errorType = 'length_limit';
      } else if (finishReason === 'function_call' || finishReason === 'tool_calls') {
        errorTitle = 'Tool Call Issue';
        errorMessage = 'The model tried to call a function but encountered an issue';
        errorCode = 'TOOL_CALL_ERROR';
        errorType = 'tool_call';
      }
      
      console.log('❌ FINISH REASON ERROR:', {
        title: errorTitle,
        message: errorMessage,
        code: errorCode,
        type: errorType
      });
      
      return NextResponse.json({
        success: false,
        error: {
          type: errorType,
          title: errorTitle,
          message: errorMessage,
          details: `Model finish reason: ${finishReason}${nativeFinishReason ? ` (${nativeFinishReason})` : ''}`,
          code: errorCode,
          retryable: finishReason !== 'content_filter', // Content filter errors shouldn't be retried
          httpStatus: finishReason === 'content_filter' ? 422 : 500
        }
      }, { status: finishReason === 'content_filter' ? 422 : 500 });
    }

    // Extract any potential images from the response
    const extractedMessage = completion.choices[0].message as OpenAIMessage;
    let responseImages = extractedMessage?.images || null;
    
    // Check if images exist and format them properly
    if (responseImages && Array.isArray(responseImages)) {
      console.log('🖼️ PROCESSING IMAGES FROM RESPONSE:');
      responseImages = responseImages.map((img, index: number) => {
        console.log(`Processing image ${index}:`, img);
        
        // Check for different possible image URL formats
        let imageUrl = null;
        if (img?.image_url?.url) {
          imageUrl = img.image_url.url;
        } else if (img?.url) {
          imageUrl = img.url;
        } else if (img?.b64_json) {
          imageUrl = `data:image/png;base64,${img.b64_json}`;
        }
        
        return {
          url: imageUrl,
          b64_json: img.b64_json || null,
          revised_prompt: img.revised_prompt || null
        };
      });
      
      console.log('🖼️ FORMATTED IMAGES:', responseImages);
    }

    return NextResponse.json({
      success: true,
      data: {
        content: completion.choices[0].message.content,
        model: completion.model,
        id: completion.id,
        finishReason: completion.choices[0].finish_reason,
        usage: completion.usage,
        originalFileName: file.name,
        originalFileSize: file.size,
        // Include any images that might be in the response
        images: responseImages,
        hasImages: !!responseImages,
        // Include complete message for debugging
        completeMessage: completion.choices[0].message,
        // Include complete response for debugging
        completeResponse: completion
      }
    });

  } catch (error) {
    console.error('❌ OPENROUTER API ERROR:');
    console.error('Full Error Object:', error);
    
    // Enhanced error structure for better frontend handling
    const errorResponse = {
      success: false,
      error: {
        type: 'unknown',
        title: 'Processing Error',
        message: 'Failed to process image with AI',
        details: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        retryable: true,
        httpStatus: 500
      }
    };
    
    // Handle standard JavaScript errors
    if (error instanceof Error) {
      console.error('🔸 Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      errorResponse.error.message = error.message;
      errorResponse.error.details = error.message;
      
      // Categorize common error types
      if (error.message.includes('API key')) {
        errorResponse.error.type = 'authentication';
        errorResponse.error.title = 'API Key Error';
        errorResponse.error.code = 'INVALID_API_KEY';
        errorResponse.error.retryable = false;
        errorResponse.error.httpStatus = 401;
      } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        errorResponse.error.type = 'network';
        errorResponse.error.title = 'Network Error';
        errorResponse.error.code = 'NETWORK_TIMEOUT';
        errorResponse.error.retryable = true;
        errorResponse.error.httpStatus = 503;
      } else if (error.message.includes('rate limit')) {
        errorResponse.error.type = 'rate_limit';
        errorResponse.error.title = 'Rate Limit Exceeded';
        errorResponse.error.code = 'RATE_LIMIT';
        errorResponse.error.retryable = true;
        errorResponse.error.httpStatus = 429;
      }
    }
    
    // Handle OpenAI SDK specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const openaiError = error as OpenAIError;
      
      console.error('🔸 OpenAI SDK Error Details:', {
        responseData: openaiError.response?.data,
        responseStatus: openaiError.response?.status,
        responseHeaders: openaiError.response?.headers
      });
      
      if (openaiError.response?.status) {
        errorResponse.error.httpStatus = openaiError.response.status;
        
        // Handle specific HTTP status codes
        switch (openaiError.response.status) {
          case 400:
            errorResponse.error.type = 'validation';
            errorResponse.error.title = 'Invalid Request';
            errorResponse.error.code = 'BAD_REQUEST';
            errorResponse.error.retryable = false;
            break;
          case 401:
            errorResponse.error.type = 'authentication';
            errorResponse.error.title = 'Authentication Failed';
            errorResponse.error.code = 'UNAUTHORIZED';
            errorResponse.error.retryable = false;
            break;
          case 403:
            errorResponse.error.type = 'authorization';
            errorResponse.error.title = 'Access Denied';
            errorResponse.error.code = 'FORBIDDEN';
            errorResponse.error.retryable = false;
            break;
          case 429:
            errorResponse.error.type = 'rate_limit';
            errorResponse.error.title = 'Rate Limit Exceeded';
            errorResponse.error.code = 'RATE_LIMIT';
            errorResponse.error.retryable = true;
            break;
          case 500:
            errorResponse.error.type = 'server';
            errorResponse.error.title = 'Server Error';
            errorResponse.error.code = 'INTERNAL_SERVER_ERROR';
            errorResponse.error.retryable = true;
            break;
          case 503:
            errorResponse.error.type = 'service';
            errorResponse.error.title = 'Service Unavailable';
            errorResponse.error.code = 'SERVICE_UNAVAILABLE';
            errorResponse.error.retryable = true;
            break;
        }
      }
      
      // Extract detailed error information from API response
      if (openaiError.response?.data) {
        try {
          const apiError = openaiError.response.data;
          if (apiError.error) {
            errorResponse.error.message = apiError.error.message || errorResponse.error.message;
            errorResponse.error.details = apiError.error.message || errorResponse.error.details;
            errorResponse.error.code = apiError.error.code || errorResponse.error.code;
          }
        } catch (parseError) {
          console.error('Failed to parse API error response:', parseError);
          errorResponse.error.details = JSON.stringify(openaiError.response.data);
        }
      }
    }
    
    // Log additional error properties
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      console.error('🔸 Additional Error Properties:', {
        code: errorObj.code,
        type: errorObj.type,
        param: errorObj.param,
        status: errorObj.status
      });
    }
    
    console.error('🔸 Final Error Response:', errorResponse);
    
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.httpStatus }
    );
  }
}