import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Check if API key is configured
    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Missing API key. Please set the GEMINI_API_KEY environment variable.',
        }),
        { status: 500 }
      );
    }

    // Format messages for Gemini API
    const formattedMessages = messages.map((message: any) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    // Prepare request for Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generation_config: {
          temperature: 0.7,
          top_p: 0.8,
          top_k: 40,
          max_output_tokens: 2048,
        },
        safety_settings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    // Process the streaming response
    const stream = async function* () {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
                yield parsed.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    };

    return new StreamingTextResponse(stream());
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during your request.' }),
      { status: 500 }
    );
  }
}
