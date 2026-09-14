import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalUIProps {
  onCommand: (command: string) => Promise<void>;
  outputHistory: string;
}

export function TerminalUI({ onCommand, outputHistory }: TerminalUIProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const lastOutputHistory = useRef<string>('');

  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
      cursorBlink: true,
      theme: {
        background: 'transparent',
        foreground: '#FBFADA', // Coffee pastel
        cursor: '#FBFADA',
      },
      fontFamily: 'monospace',
      fontSize: 14,
    });
    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    term.current.write('student@secarena:~$ ');

    term.current.onData((e) => {
      switch (e) {
        case '\r': // Enter
          const command = inputBuffer.current.trim();
          term.current?.write('\r\n');
          if (command) {
            onCommand(command).then(() => {
              term.current?.write('student@secarena:~$ ');
            });
          } else {
            term.current?.write('student@secarena:~$ ');
          }
          inputBuffer.current = '';
          break;
        case '\u007F': // Backspace
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.current?.write('\b \b');
          }
          break;
        default:
          if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
            inputBuffer.current += e;
            term.current?.write(e);
          }
      }
    });

    const handleResize = () => {
      fitAddon.current?.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.current?.dispose();
    };
  }, []);

  // Update output when outputHistory changes
  useEffect(() => {
    if (term.current && outputHistory && outputHistory !== lastOutputHistory.current) {
      // Find what's new (simplified for now, assumes only append)
      // Usually, it's better to just pass the latest output chunk instead of full history
      const newOutput = outputHistory.slice(lastOutputHistory.current.length);
      const lines = newOutput.split('\n');
      for (const line of lines) {
        if (line) {
          term.current.write(line + '\r\n');
        }
      }
      lastOutputHistory.current = outputHistory;
    }
  }, [outputHistory]);

  return (
    <div className="w-full h-full bg-transparent relative p-2">
      <div ref={terminalRef} className="w-full h-full text-left" />
    </div>
  );
}
