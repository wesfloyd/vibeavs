"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Store the prompt in localStorage or state management
      localStorage.setItem('initialPrompt', prompt);
      router.push('/chat');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-6 text-indigo-900">VibeAVS</h1>
        <p className="text-xl mb-10 text-gray-700">
          Your AI chat companion that understands your vibe.
        </p>
        
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition h-32 resize-none"
                placeholder="What would you like to chat about today?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
              <button
                type="submit"
                className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                disabled={!prompt.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!prompt.trim()}
            >
              Start Chatting
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
