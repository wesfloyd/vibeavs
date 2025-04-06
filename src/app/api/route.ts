import { CoreMessage, streamText } from 'ai';
import { google } from '@ai-sdk/google'; // Uncommented the import

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // Get the API key from environment variables
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    // Handle the case where the API key is missing
    return new Response(JSON.stringify({ error: 'Google API key is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Instantiate the Google Gemini model
  const model = google('models/gemini-pro', { apiKey }); // Using gemini-pro and passing the key

  try {
    const result = await streamText({
      model: model, // Use the instantiated model
      // Optional: Add a system prompt if needed
      system: 'You are a helpful assistant designed to validate user ideas by providing constructive feedback, identifying potential challenges, and suggesting improvements.',
      messages,
    });

    // Respond with the stream
    return result.toAIStreamResponse();

  } catch (error) {
    // Basic error handling
    console.error('Error calling Gemini API:', error);
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    // Check if it's an API error with a specific message
    if (error instanceof Error) {
        // You might want to check for specific error types or messages from the SDK
        // For now, just use the error message if available
        errorMessage = error.message || errorMessage;
        // Potentially map specific errors to different status codes if needed
    }


    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}