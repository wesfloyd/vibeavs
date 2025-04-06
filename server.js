/**
 * Simple Express server to handle API requests from the React frontend
 */
const express = require('express');
const path = require('path');
const { CoreMessage, streamText } = require('ai');
const { google } = require('@ai-sdk/google');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

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
    const modelName = process.env.MODEL_NAME || 'models/gemini-pro';
    console.log("Using model:", modelName);

    // Instantiate the Google Gemini model
    console.log("Initializing Gemini model...");
    const model = google(modelName);
    console.log("Model initialized successfully");

    try {
      console.log("Sending request to Gemini API...");
      
      const result = await streamText({
        model: model,
        // Optional: Add a system prompt if needed
        system: 'You are a helpful assistant designed to validate user ideas by providing constructive feedback, identifying potential challenges, and suggesting improvements.',
        messages,
      });
      
      console.log("Received response from Gemini API successfully");
      
      // Respond with the stream
      result.pipe(res);
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

// For any other GET request, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});