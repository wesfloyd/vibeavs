import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import styles from '../styles/ChatPage.module.css';

// Helper to parse search params
function useSearchParams() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function ChatPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  const initialProjectName = searchParams.get('project') || 'Project My-AVS'; // Get project name or use default

  // State for editable project name
  const [projectName, setProjectName] = useState(initialProjectName);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingProjectName && projectNameInputRef.current) {
      projectNameInputRef.current.focus();
      projectNameInputRef.current.select();
    }
  }, [isEditingProjectName]);

  // Use AI SDK hook
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat', // We'll change this to use our API endpoint
    initialMessages: initialPrompt ? [{ id: 'initial-user', role: 'user', content: initialPrompt }] : [],
    id: `chat-${Date.now()}`, // Add a unique ID for each chat session to prevent caching
    onError: (error) => {
      console.error('Chat API error:', error);
      setIsLoading(false);
    },
    onFinish: () => {
      console.log('Chat message stream completed');
      setIsLoading(false);
    }
  });

  // Add loading state to show feedback during API calls
  const [isLoading, setIsLoading] = useState(false);

  // Function to automatically send a message
  const sendMessage = (messageText: string) => {
    console.log('SEND_MESSAGE called with:', messageText);
    setIsLoading(true);
    
    // Let's debug what's in the messages array at this point
    console.log('Current messages state before sending:', JSON.stringify(messages));
    
    // Use the AI SDK's handleSubmit method
    try {
      console.log('Calling handleSubmit with synthetic event');
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
      console.log('handleSubmit called successfully');
      
      // Monitor network requests in the console
      console.log('Check Network tab in DevTools for API call to /api/chat');
    } catch (error) {
      console.error('Error during handleSubmit:', error);
      setIsLoading(false);
    }
  };
  
  // Create a modified submit handler to track loading state
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log('FORM_SUBMIT called with event:', e);
    e.preventDefault(); // Ensure we prevent the default form submission
    
    if (!input.trim() && messages.length === 0) {
      console.log('Empty submission prevented');
      return; // Prevent empty submissions
    }
    
    console.log('Setting loading state to true');
    setIsLoading(true);
    
    // Call the original submit handler
    console.log('Calling original handleSubmit from form');
    handleSubmit(e);
    console.log('Original handleSubmit called');
    
    // Since handleSubmit might not return a promise in all implementations,
    // we'll use a timeout to reset loading state
    setTimeout(() => {
      console.log('Resetting loading state via timeout');
      setIsLoading(false);
    }, 3000); // Reasonable timeout for most responses
  };

  // Handle the initial prompt and auto-sending
  useEffect(() => {
    const shouldAutoSend = searchParams.get('autosend') === 'true';
    console.log('AUTO_SUBMISSION_CHECK:', { 
      initialPrompt, 
      shouldAutoSend, 
      messagesLength: messages.length,
      messagesContent: JSON.stringify(messages)
    });
    
    // If autosend is requested and we have an initial prompt,
    // and we haven't already initiated a send (messages.length should be exactly 1 - just the user message)
    if (shouldAutoSend && initialPrompt && messages.length === 1) {
      // We only want to send if the only message is the user's initial prompt
      const hasOnlyUserMessage = messages.length === 1 && messages[0].role === 'user';
      
      console.log('Checking conditions for auto-submission:', { 
        hasOnlyUserMessage,
        firstMessage: messages[0]
      });
      
      if (hasOnlyUserMessage) {
        console.log('AUTO_SUBMIT: Conditions met for auto-submission');
        
        // Try a direct fetch to the API endpoint first as a test
        console.log('Testing direct API connection...');
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages
          }),
        })
        .then(response => {
          console.log('Direct API test response status:', response.status);
          return response.text();
        })
        .then(text => {
          console.log('Direct API test response (first 100 chars):', text.substring(0, 100));
        })
        .catch(error => {
          console.error('Direct API test error:', error);
        });
        
        // Continue with normal auto-submission via useChat
        console.log('Scheduling auto-submission via useChat...');
        const timer = setTimeout(() => {
          console.log('AUTO_SUBMIT: Timer fired, calling sendMessage');
          sendMessage(initialPrompt);
        }, 800);
        
        return () => {
          console.log('AUTO_SUBMIT: Cleanup - clearing timer');
          clearTimeout(timer);
        };
      }
    }
  }, [initialPrompt, messages, searchParams, handleSubmit, sendMessage]);

  return (
    <div className={styles.chatContainer}>
      {/* Left Column: Chat Interface */}
      <div className={styles.chatArea}>
        <div className={styles.messages}>
          {messages.length > 0 ? (
            messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.message} ${
                  m.role === 'user' ? styles.userMessage : styles.aiMessage
                }`}
              >
                <span className={styles.messageRole}>
                  {m.role === 'user' ? 'You' : 'AI'}:
                </span>
                <p>{m.content}</p>
              </div>
            ))
          ) : (
             // Display something if there are no messages yet
             <p className={styles.noMessages}>
               {initialPrompt ? `Validating: "${initialPrompt}"` : "Send a message to start..."}
             </p>
          )}
          
          {/* Show loading indicator */}
          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <span className={styles.messageRole}>AI:</span>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        {/* Input form using the useChat hook */}
        <form onSubmit={handleFormSubmit} className={styles.inputForm} id="chatForm">
          <input
            className={styles.inputField}
            value={input}
            placeholder="Send a message"
            onChange={handleInputChange}
            disabled={isLoading} // Disable input while loading
          />
           {/* Send Button - similar to landing page */}
           <button type="submit" className={styles.sendButton} aria-label="Send message" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-7-7a.5.5 0 0 0-.708.708L14.293 8l-6.147 6.146a.5.5 0 0 0 .708.708z"/>
                  <path d="M1 8a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13A.5.5 0 0 0 1 8"/>
              </svg>
          </button>
        </form>
      </div>

      {/* Right Column: Static Content */}
      <div className={styles.sidebar}>
        {/* Editable Project Name - Moved to top of sidebar */}
        <div className={styles.sidebarProjectHeader}> {/* New container for styling */}
          {isEditingProjectName ? (
            <input
              ref={projectNameInputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingProjectName(false)} // Save on blur
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingProjectName(false); // Save on Enter
                  e.preventDefault(); // Prevent form submission if inside one
                }
              }}
              className={styles.projectNameInput} // Style for input
            />
          ) : (
            <h2 // Using h2 for a more prominent header
              className={styles.projectNameDisplay} // Style for display text
              onClick={() => setIsEditingProjectName(true)}
              title="Click to edit project name" // Add tooltip
            >
              {projectName}
            </h2>
          )}
        </div>

        <div className={styles.sidebarHeader}>
          {/* Placeholder for Idea/Design/Code tabs */}
          <span className={`${styles.tab} ${styles.activeTab}`}>Idea</span>
          <span className={styles.tab}>Design</span>
          <span className={styles.tab}>Code</span>
        </div>
        <div className={styles.sidebarContent}>
          <p className={styles.fileName}>User Story.md</p>
          <pre className={styles.codeBlock}>
            {`As a project validator,
I want to validate new
ideas so that I can
ensure they meet
the project's
requirements.`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;