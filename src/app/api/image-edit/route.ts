import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_KEY,
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

    console.log('Processing image edit request:', {
      fileName: file.name,
      fileSize: file.size,
      prompt: prompt.substring(0, 50) + '...',
    });

    // Call Fal AI API
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt,
        image_urls: [dataUrl], // Array to support future multi-image feature
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

    return NextResponse.json({
      success: true,
      data: {
        images: result.data.images,
        description: result.data.description,
        originalFileName: file.name,
        originalFileSize: file.size,
        requestId: result.requestId
      }
    });

  } catch (error) {
    console.error('Image edit API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process image edit', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}