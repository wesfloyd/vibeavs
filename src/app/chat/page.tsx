'use client';

import { useChat } from '@ai-sdk/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState, useRef } from 'react';
import styles from './ChatPage.module.css';

// Wrap the component that uses useSearchParams in Suspense
function ChatComponent() {
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

  // NOTE: The '/api/chat' route needs to be created, but won't
  // have full Gemini functionality in this minimal version.
  // It needs to exist for useChat to work.
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat', // Specify your API route
  });

  // Effect to potentially add the initial prompt as the first message
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      // Add the user's initial prompt to the messages state
      setMessages([{ id: 'initial-user', role: 'user', content: initialPrompt }]);
      // Optional: You could immediately trigger a backend response here if needed
      // handleSubmit(); // This would send the initial prompt to your API
    }
    // Only run this effect once when the component mounts or initialPrompt changes
    // Make sure setMessages is stable or included if necessary
  }, [initialPrompt, setMessages]); // Removed messages.length to avoid potential loops if setMessages updates messages

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
        </div>

        {/* Input form using the useChat hook */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            className={styles.inputField}
            value={input}
            placeholder="Send a message"
            onChange={handleInputChange}
          />
           {/* Send Button - similar to landing page */}
           <button type="submit" className={styles.sendButton} aria-label="Send message">
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

// Export the component wrapped in Suspense
export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatComponent />
    </Suspense>
  )
}