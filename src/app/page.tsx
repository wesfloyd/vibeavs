'use client'; // Required for useState and useRouter

import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleSend = () => {
    if (prompt.trim()) {
      // Navigate to chat page with just the prompt
      router.push(`/chat?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    handleSend();
  };

   const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter key is pressed without Shift key
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in textarea
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        What do you want to <span className={styles.highlight}>validate</span> ?
      </h1>

      <p className={styles.subtitle}>
        Prompt, run, edit, and deploy full-stack web3 and verifiable apps.
      </p>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.inputArea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can EigenLayer help you today?"
            rows={4}
          />
          <button type="submit" className={styles.sendButton} aria-label="Send prompt">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-7-7a.5.5 0 0 0-.708.708L14.293 8l-6.147 6.146a.5.5 0 0 0 .708.708z"/>
              <path d="M1 8a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13A.5.5 0 0 0 1 8"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}