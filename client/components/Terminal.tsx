"use client";

import { useEffect, useRef } from 'react';

interface TerminalProps {
  socket: any;
}

export default function Terminal({ socket }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    let term: any;

    const initTerminal = async () => {
      const { Terminal: XTerm } = await import('xterm');
      const { FitAddon } = await import('xterm-addon-fit');
      await import('xterm/css/xterm.css');

      term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: '#000000',
          foreground: '#ffffff',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current!);
      fitAddon.fit();

      socket.on('output', (data: string) => {
        term.write(data);
      });

      term.onData((data: string) => {
        socket.emit('input', data);
      });

      window.addEventListener('resize', () => fitAddon.fit());
    };

    initTerminal();

    return () => {
      if (term) term.dispose();
    };
  }, [socket]);

  return (
    <div className='w-full h-full bg-black'>
      <div ref={terminalRef} className='w-full h-full' />
    </div>
  );
}