import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0a0e17] max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
