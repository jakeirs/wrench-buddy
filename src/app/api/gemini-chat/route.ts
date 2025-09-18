import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: message,
    });

    return Response.json({
      response: result.text,
      success: true
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return Response.json({
      error: 'Failed to get response from Gemini',
      success: false
    }, { status: 500 });
  }
}