"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, List, Terminal as TerminalIcon } from 'lucide-react';

interface ChatInterfaceProps {
  socket: any;
}

export default function ChatInterface({ socket }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState<{ options: string[] } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('output', (data: string) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('prompt-detected', (data: any) => {
       // Parse selections if possible
       if (data.type === 'selection') {
         // Simplified: looking for [1], [2] etc
         const matches = data.raw.match(/\\[(\d+)\\]/g);
         if (matches) {
            setPrompts({ options: matches });
         }
       }
    });

    return () => {
      socket.off('output');
      socket.off('prompt-detected');
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input) return;
    socket.emit('input', input + '\n');
    setInput('');
  };

  const handleSelect = (option: string) => {
    const index = option.replace(/\\[|\\]/g, '');
    socket.emit('input', index + '\n');
    setPrompts(null);
  };

  return (
    <div className='flex flex-col h-full bg-[#1e1e1e] text-white'>
      <div className='flex-1 overflow-y-auto p-4 font-mono text-sm'>
        {messages.map((msg, i) => (
          <div key={i} className='mb-2 whitespace-pre-wrap'>{msg}</div>
        ))}
        {prompts && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {prompts.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className='px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors'
              >
                Option {opt}
              </button>
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className='p-4 bg-[#2d2d2d] border-t border-gray-700'>
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1 bg-black border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm'
            placeholder='Send a command...'
          />
          <button
            onClick={handleSend}
            className='p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors'
          >
            <Send size={18} />
          </button>
          <button className='p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors'>
            <Mic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}