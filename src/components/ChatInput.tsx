import { useState } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const [rows, setRows] = useState(1);
  
  const adjustRows = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const minRows = 1;
    const maxRows = 5;
    
    // Calculate content height
    const previousRows = textarea.rows;
    textarea.rows = minRows; // Reset rows to calculate properly
    
    const currentRows = Math.floor(textarea.scrollHeight / 24); // Assuming line height is 24px
    
    if (currentRows === previousRows) {
      textarea.rows = currentRows;
    }
    
    const newRows = currentRows < maxRows ? currentRows : maxRows;
    setRows(newRows);
    
    // Handle input change after adjusting rows
    handleInputChange(e);
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setRows(1); // Reset rows after submitting
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        const form = e.currentTarget.form;
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative">
      <textarea
        className="w-full p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
        placeholder="Type a message..."
        value={input}
        onChange={adjustRows}
        onKeyDown={handleKeyDown}
        rows={rows}
        disabled={isLoading}
        required
      />
      <button
        type="submit"
        className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !input.trim()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
