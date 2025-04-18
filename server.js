// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the dist directory (Vite output)
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  console.log("=== API ROUTE CALLED ===");
  
  try {
    const { messages } = req.body;
    console.log("Messages extracted:", JSON.stringify(messages));

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("API key exists:", !!apiKey);

    if (!apiKey) {
      console.error("API KEY MISSING - Unable to proceed with Gemini request");
      return res.status(500).json({ 
        error: 'Google Generative AI API key is not configured. Please set the GOOGLE_GENERATIVE_AI_API_KEY environment variable.' 
      });
    }

    // Get model name from environment variable or use default
    // Note: The @ai-sdk/google package expects model names without the 'models/' prefix
    
    // Strip the 'models/' prefix if it exists
    const modelName = process.env.MODEL_NAME || 'models/gemini-pro';
    console.log("Using model:", modelName);

    // Instantiate the Google Gemini model
    console.log("Initializing Gemini model...");
    const model = google(modelName);
    console.log("Model initialized successfully");

    try {
      console.log("Sending request to Gemini API...");
      
      // Using the streamText method from 'ai' package with the Google model
      const stream = await streamText({
        model: model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.7
      });
      
      console.log("Streaming response from Gemini API");
      
      // Get the response data from the stream
      const response = await Promise.resolve(stream);
      
      // Extract the content from the response
      const fullResponse = response.content;
      console.log("Full response assembled:", fullResponse);
      
      // Return the response as JSON
      return res.json({
        id: Date.now().toString(),
        role: 'assistant',
        content: fullResponse
      });
      
    } catch (error) {
      // Basic error handling
      console.error('Error calling Gemini API:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      let errorMessage = 'An error occurred while processing your request.';
      let statusCode = 500;

      // Check if it's an API error with a specific message
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        console.error('Error message:', errorMessage);
        // Log stack trace if available
        if (error.stack) {
          console.error('Error stack:', error.stack);
        }
      }

      return res.status(statusCode).json({ error: errorMessage });
    }
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    return res.status(400).json({ error: 'Invalid request format' });
  }
});

// Add a test endpoint to check API
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// For any other GET request, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});