import { motion } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${isUser ? 'bg-primary text-white' : 'bg-white shadow-md'}`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}
