"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useChat } from 'ai/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const router = useRouter();
  const [initialPrompt, setInitialPrompt] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
  });

  useEffect(() => {
    // Check if there's an initial prompt in localStorage
    const storedPrompt = localStorage.getItem('initialPrompt');
    if (storedPrompt) {
      setInitialPrompt(storedPrompt);
      localStorage.removeItem('initialPrompt'); // Remove after retrieving
      
      // Submit the initial prompt
      setMessages([
        { id: '1', role: 'user', content: storedPrompt }
      ]);
      
      const event = new SubmitEvent('submit');
      const initialPromptSubmit = {
        preventDefault: () => {},
        target: { message: { value: storedPrompt } }
      } as unknown as React.FormEvent<HTMLFormElement>;
      
      handleSubmit(initialPromptSubmit);
    }
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gray-50"
    >
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-900">VibeAVS</h1>
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </header>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-w-6xl w-full mx-auto"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <ChatMessage message={{ id: 'loading', role: 'assistant', content: 'Thinking...' }} />}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <ChatInput 
            input={input} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </motion.div>
  );
}
