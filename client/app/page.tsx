"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatInterface from '@/components/ChatInterface';
import Terminal from '@/components/Terminal';
import { LayoutGrid, MessageSquare, Terminal as TerminalIcon, Settings, Loader2 } from 'lucide-react';

export default function Home() {
  const [socket, setSocket] = useState<any>(null);
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'terminal'>('chat');

  const handleLogin = () => {
    if (!token) return;
    setIsConnecting(true);

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const url = protocol + '//' + hostname + ':3001';

    const newSocket = io(url, {
      auth: { token },
      reconnectionAttempts: 3,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      setIsLoggedIn(true);
      setIsConnecting(false);
      setSocket(newSocket);
    });

    newSocket.on('connect_error', (err) => {
      setIsConnecting(false);
      alert('Connection failed: ' + err.message);
    });
  };

  if (!isLoggedIn) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-[#1e1e1e] text-white p-6'>
        <div className='w-full max-w-md bg-[#2d2d2d] rounded-2xl p-8 border border-gray-700 shadow-2xl'>
          <h1 className='text-3xl font-bold mb-2 text-center'>PortaCode</h1>
          <p className='text-gray-400 text-center mb-8'>Remote Gemini CLI Proxy</p>
          <input
            type='password'
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className='w-full bg-black border border-gray-600 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-blue-500 transition-colors'
            placeholder='Enter Master Key'
          />
          <button
            onClick={handleLogin}
            disabled={isConnecting}
            className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2'
          >
            {isConnecting ? <Loader2 className='animate-spin' /> : 'Connect'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-[100dvh] bg-black text-white'>
      <header className='flex items-center justify-between p-4 bg-[#2d2d2d] border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse' />
          <span className='font-bold text-lg'>PortaCode</span>
        </div>
      </header>

      <main className='flex-1 relative overflow-hidden'>
        {activeTab === 'chat' ? (
          <ChatInterface socket={socket} />
        ) : (
          <Terminal socket={socket} />
        )}
      </main>

      <nav className='flex items-center justify-around p-4 bg-[#2d2d2d] border-t border-gray-700 pb-[env(safe-area-inset-bottom)]'>
        <button
          onClick={() => setActiveTab('chat')}
          className={'flex flex-col items-center gap-1 transition-colors ' + (activeTab === 'chat' ? 'text-blue-500' : 'text-gray-400')}
        >
          <MessageSquare size={24} />
          <span className='text-[10px] font-bold uppercase'>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={'flex flex-col items-center gap-1 transition-colors ' + (activeTab === 'terminal' ? 'text-blue-500' : 'text-gray-400')}
        >
          <TerminalIcon size={24} />
          <span className='text-[10px] font-bold uppercase'>Terminal</span>
        </button>
      </nav>
    </div>
  );
}