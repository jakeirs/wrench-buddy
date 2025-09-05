import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import OpenAI from 'openai';

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_KEY,
});

// Configure OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": "Nano Banana App",
  },
});

// Unified error structure
interface ApiError {
  type: string;
  title: string;
  message: string;
  details: string;
  code: string;
  retryable: boolean;
  httpStatus: number;
}

// Unified response structure
interface MixerResponse {
  success: boolean;
  data?: {
    content: string;
    images?: Array<{
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
    }>;
    model: string;
    provider: 'fal' | 'openrouter';
    id: string;
    finishReason?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    originalFileNames: string[];
    originalFileSizes: number[];
    hasImages: boolean;
  };
  error?: ApiError;
}

async function handleFalRequest(files: File[], prompt: string): Promise<MixerResponse> {
  try {
    // Convert all files to base64 data URLs
    const imageUrls: string[] = [];
    const fileNames: string[] = [];
    const fileSizes: number[] = [];
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      imageUrls.push(dataUrl);
      fileNames.push(file.name);
      fileSizes.push(file.size);
    }

    console.log('Processing FAL AI multi-image edit request:', {
      imageCount: files.length,
      fileNames,
      prompt: prompt.substring(0, 50) + '...',
    });

    // Call Fal AI API with multiple images
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt,
        image_urls: imageUrls,
        num_images: 1,
        output_format: "jpeg",
        sync_mode: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('Fal AI processing update:', update.logs?.map(log => log.message) || []);
        }
      },
    });

    console.log('Fal AI response received:', {
      imagesCount: result.data.images?.length || 0,
      hasDescription: !!result.data.description,
      requestId: result.requestId
    });

    return {
      success: true,
      data: {
        content: result.data.description || '',
        images: result.data.images || [],
        model: 'fal-ai/nano-banana/edit',
        provider: 'fal',
        id: result.requestId,
        originalFileNames: fileNames,
        originalFileSizes: fileSizes,
        hasImages: !!(result.data.images?.length)
      }
    };

  } catch (error) {
    console.error('FAL AI error:', error);
    
    // Enhanced error logging for FAL AI errors
    if (error && typeof error === 'object') {
      const falError = error as any;
      console.error('FAL AI detailed error info:', {
        name: falError.name,
        message: falError.message,
        status: falError.status,
        body: falError.body,
        stack: falError.stack
      });
      
      // Log the full error body if it exists (contains validation details)
      if (falError.body) {
        console.error('FAL AI error body details:', JSON.stringify(falError.body, null, 2));
      }
    }
    
    // Determine error type and details based on FAL error
    let errorType = 'model';
    let errorTitle = 'FAL AI Error';
    let errorMessage = 'Failed to process images with FAL AI';
    let errorDetails = error instanceof Error ? error.message : 'Unknown FAL AI error';
    let errorCode = 'FAL_ERROR';
    let httpStatus = 500;
    let retryable = true;
    
    if (error && typeof error === 'object') {
      const falError = error as any;
      
      if (falError.status === 422) {
        errorType = 'validation';
        errorTitle = 'FAL AI Validation Error';
        errorMessage = 'Invalid request parameters for FAL AI';
        errorCode = 'FAL_VALIDATION_ERROR';
        httpStatus = 422;
        retryable = false;
        
        // Extract validation details from body
        if (falError.body && typeof falError.body === 'object') {
          if (falError.body.message) {
            errorMessage = falError.body.message;
            errorDetails = falError.body.message;
          }
          if (falError.body.detail) {
            errorDetails = Array.isArray(falError.body.detail) 
              ? falError.body.detail.map((d: any) => `${d.loc?.join('.')} - ${d.msg}`).join(', ')
              : falError.body.detail;
          }
        }
      } else if (falError.status === 401) {
        errorType = 'authentication';
        errorTitle = 'FAL AI Authentication Error';
        errorMessage = 'Invalid FAL AI API key';
        errorCode = 'FAL_AUTH_ERROR';
        httpStatus = 401;
        retryable = false;
      } else if (falError.status === 429) {
        errorType = 'rate_limit';
        errorTitle = 'FAL AI Rate Limit';
        errorMessage = 'FAL AI rate limit exceeded';
        errorCode = 'FAL_RATE_LIMIT';
        httpStatus = 429;
        retryable = true;
      }
    }
    
    return {
      success: false,
      error: {
        type: errorType,
        title: errorTitle,
        message: errorMessage,
        details: errorDetails,
        code: errorCode,
        retryable: retryable,
        httpStatus: httpStatus
      }
    };
  }
}

async function handleOpenRouterRequest(files: File[], prompt: string): Promise<MixerResponse> {
  try {
    // Convert all files to base64 data URLs
    const contentItems: Array<{type: string, text?: string, image_url?: {url: string}}> = [];
    const fileNames: string[] = [];
    const fileSizes: number[] = [];
    
    // Add text prompt first
    contentItems.push({
      type: "text",
      text: prompt
    });
    
    // Add all images
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      contentItems.push({
        type: "image_url",
        image_url: {
          url: dataUrl
        }
      });
      
      fileNames.push(file.name);
      fileSizes.push(file.size);
    }

    console.log('Processing OpenRouter multi-image request:', {
      imageCount: files.length,
      fileNames,
      model: 'google/gemini-2.5-flash-image-preview:free',
      promptLength: prompt.length
    });

    // Prepare the request payload
    const requestPayload = {
      model: "google/gemini-2.5-flash-image-preview:free",
      messages: [
        {
          role: "user",
          content: contentItems
        }
      ],
      max_tokens: 1000,
    };

    console.log('Sending to OpenRouter:', {
      model: requestPayload.model,
      contentItemsCount: contentItems.length,
      imageCount: files.length
    });

    // Call OpenRouter API
    const completion = await openai.chat.completions.create(requestPayload);

    console.log('OpenRouter response received:', {
      model: completion.model,
      id: completion.id,
      finishReason: completion.choices[0]?.finish_reason,
      contentLength: completion.choices[0]?.message?.content?.length || 0
    });

    // Check finish_reason for issues
    const choice = completion.choices[0];
    const finishReason = choice?.finish_reason;
    
    // Handle non-successful finish reasons
    if (finishReason !== 'stop') {
      let errorTitle = 'Processing Issue';
      let errorMessage = 'The AI model encountered an issue while processing your request';
      let errorCode = 'MODEL_ISSUE';
      let errorType = 'model';
      
      if (finishReason === 'content_filter') {
        errorTitle = 'Content Prohibited';
        errorMessage = 'Content is prohibited by content policy';
        errorCode = 'CONTENT_FILTER';
        errorType = 'content_filter';
      } else if (finishReason === 'length') {
        errorTitle = 'Response Too Long';
        errorMessage = 'The response was truncated due to length limits';
        errorCode = 'LENGTH_LIMIT';
        errorType = 'length_limit';
      }
      
      return {
        success: false,
        error: {
          type: errorType,
          title: errorTitle,
          message: errorMessage,
          details: `Model finish reason: ${finishReason}`,
          code: errorCode,
          retryable: finishReason !== 'content_filter',
          httpStatus: finishReason === 'content_filter' ? 422 : 500
        }
      };
    }

    // Extract any potential images from the response
    const responseMessage = completion.choices[0].message as any;
    let responseImages = responseMessage?.images || null;
    
    // Check if images exist and format them properly
    if (responseImages && Array.isArray(responseImages)) {
      console.log('Processing images from OpenRouter response:', responseImages.length);
      responseImages = responseImages.map((img: any) => {
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
    }

    return {
      success: true,
      data: {
        content: completion.choices[0].message.content || '',
        images: responseImages,
        model: completion.model,
        provider: 'openrouter',
        id: completion.id,
        finishReason: completion.choices[0].finish_reason,
        usage: completion.usage,
        originalFileNames: fileNames,
        originalFileSizes: fileSizes,
        hasImages: !!responseImages
      }
    };

  } catch (error) {
    console.error('OpenRouter error:', error);
    
    // Handle OpenAI SDK specific errors (same logic as existing openrouter-edit)
    const errorResponse: ApiError = {
      type: 'unknown',
      title: 'Processing Error',
      message: 'Failed to process images with OpenRouter',
      details: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      retryable: true,
      httpStatus: 500
    };
    
    // Standard JavaScript errors
    if (error instanceof Error) {
      errorResponse.message = error.message;
      errorResponse.details = error.message;
      
      if (error.message.includes('API key')) {
        errorResponse.type = 'authentication';
        errorResponse.title = 'API Key Error';
        errorResponse.code = 'INVALID_API_KEY';
        errorResponse.retryable = false;
        errorResponse.httpStatus = 401;
      } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        errorResponse.type = 'network';
        errorResponse.title = 'Network Error';
        errorResponse.code = 'NETWORK_TIMEOUT';
        errorResponse.retryable = true;
        errorResponse.httpStatus = 503;
      } else if (error.message.includes('rate limit')) {
        errorResponse.type = 'rate_limit';
        errorResponse.title = 'Rate Limit Exceeded';
        errorResponse.code = 'RATE_LIMIT';
        errorResponse.retryable = true;
        errorResponse.httpStatus = 429;
      }
    }
    
    // Handle OpenAI SDK specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const openaiError = error as any;
      
      if (openaiError.response?.status) {
        errorResponse.httpStatus = openaiError.response.status;
        
        switch (openaiError.response.status) {
          case 400:
            errorResponse.type = 'validation';
            errorResponse.title = 'Invalid Request';
            errorResponse.code = 'BAD_REQUEST';
            errorResponse.retryable = false;
            break;
          case 401:
            errorResponse.type = 'authentication';
            errorResponse.title = 'Authentication Failed';
            errorResponse.code = 'UNAUTHORIZED';
            errorResponse.retryable = false;
            break;
          case 429:
            errorResponse.type = 'rate_limit';
            errorResponse.title = 'Rate Limit Exceeded';
            errorResponse.code = 'RATE_LIMIT';
            errorResponse.retryable = true;
            break;
          case 500:
            errorResponse.type = 'server';
            errorResponse.title = 'Server Error';
            errorResponse.code = 'INTERNAL_SERVER_ERROR';
            errorResponse.retryable = true;
            break;
        }
      }
      
      if (openaiError.response?.data?.error) {
        errorResponse.message = openaiError.response.data.error.message || errorResponse.message;
        errorResponse.details = openaiError.response.data.error.message || errorResponse.details;
        errorResponse.code = openaiError.response.data.error.code || errorResponse.code;
      }
    }
    
    return {
      success: false,
      error: errorResponse
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const model = formData.get('model') as string;
    
    // Get all uploaded images
    const files: File[] = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`) as File;
      if (file) {
        files.push(file);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            type: 'validation',
            title: 'No Images',
            message: 'No image files provided',
            details: 'Please upload at least one image',
            code: 'NO_IMAGES',
            retryable: false,
            httpStatus: 400
          }
        },
        { status: 400 }
      );
    }

    if (!prompt?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            type: 'validation',
            title: 'No Prompt',
            message: 'No prompt provided',
            details: 'Please provide a description of what you want to do with the images',
            code: 'NO_PROMPT',
            retryable: false,
            httpStatus: 400
          }
        },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            type: 'validation',
            title: 'No Model',
            message: 'No model specified',
            details: 'Please select a model to process the images',
            code: 'NO_MODEL',
            retryable: false,
            httpStatus: 400
          }
        },
        { status: 400 }
      );
    }

    console.log('Processing mixer request:', {
      model,
      imageCount: files.length,
      promptLength: prompt.length,
      fileNames: files.map(f => f.name)
    });

    let result: MixerResponse;

    // Route to appropriate handler based on model
    if (model.startsWith('fal-ai/')) {
      result = await handleFalRequest(files, prompt);
    } else if (model.includes('google/gemini') || model.includes('openrouter')) {
      result = await handleOpenRouterRequest(files, prompt);
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            type: 'validation',
            title: 'Unknown Model',
            message: 'Unknown model specified',
            details: `Model "${model}" is not supported`,
            code: 'UNKNOWN_MODEL',
            retryable: false,
            httpStatus: 400
          }
        },
        { status: 400 }
      );
    }

    if (!result.success && result.error) {
      return NextResponse.json(result, { status: result.error.httpStatus });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Mixer API general error:', error);
    
    const errorResponse = {
      success: false,
      error: {
        type: 'server',
        title: 'Server Error',
        message: 'Internal server error occurred',
        details: error instanceof Error ? error.message : 'Unknown server error',
        code: 'INTERNAL_ERROR',
        retryable: true,
        httpStatus: 500
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}