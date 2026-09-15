import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalUIProps {
  onCommand: (command: string) => Promise<string | undefined>;
  history?: { user: string; command: string; output: string }[];
  currentUser?: string;
}

export function TerminalUI({ onCommand, history, currentUser }: TerminalUIProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const onCommandRef = useRef(onCommand);
  const historyRef = useRef(history);
  const renderedCount = useRef(0);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

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

    term.current.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && e.type === 'keydown') {
        const selection = term.current?.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection);
          term.current?.clearSelection();
          return false;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && e.type === 'keydown') {
        navigator.clipboard.readText().then((text) => {
          let printable = '';
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if ((char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E)) || char >= '\u00a0') {
              printable += char;
            }
          }
          if (printable.length > 0) {
            inputBuffer.current += printable;
            term.current?.write(printable);
          }
        }).catch(() => {});
        return false;
      }
      return true;
    });

    if (!history || history.length === 0) {
      term.current.write('student@secarena:~$ ');
    }

    term.current.onData((e) => {
      switch (e) {
        case '\r': // Enter
          const command = inputBuffer.current.trim();
          if (historyRef.current === undefined) {
             term.current?.write('\r\n');
          }
          if (command) {
            if (command === 'clear') {
                term.current?.reset();
                term.current?.write('student@secarena:~$ ');
                onCommandRef.current(command);
            } else {
                onCommandRef.current(command).then((out) => {
                  if (historyRef.current === undefined) {
                      if (out) {
                        const lines = out.split('\n');
                        for (const line of lines) {
                          term.current?.write(line + '\r\n');
                        }
                      }
                      term.current?.write('student@secarena:~$ ');
                  }
                });
            }
          } else {
            if (historyRef.current === undefined) {
               term.current?.write('student@secarena:~$ ');
            }
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
          // Handle multi-character strings (like pastes) or single characters
          let printable = '';
          for (let i = 0; i < e.length; i++) {
            const char = e[i];
            if (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E) || char >= '\u00a0') {
              printable += char;
            }
          }
          if (printable.length > 0) {
            inputBuffer.current += printable;
            term.current?.write(printable);
          }
          break;
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

  useEffect(() => {
    if (!term.current || !history) return;
    
    setTimeout(() => {
        fitAddon.current?.fit();
    }, 50);

    if (history.length > renderedCount.current) {
        term.current.write('\x1b[2K\r'); // clear current line
        
        for (let i = renderedCount.current; i < history.length; i++) {
            const item = history[i];
            
            term.current.write(`\x1b[33m${item.user}@secarena:~$\x1b[0m ${item.command}\r\n`);
            if (item.output) {
                const lines = item.output.split('\n');
                for (const line of lines) {
                    term.current.write(line + '\r\n');
                }
            }
        }
        
        term.current.write(`student@secarena:~$ ${inputBuffer.current}`);
        renderedCount.current = history.length;
    }
  }, [history, currentUser]);



  return (
    <div className="w-full h-full bg-transparent relative p-2">
      <div ref={terminalRef} className="w-full h-full text-left" />
    </div>
  );
}
