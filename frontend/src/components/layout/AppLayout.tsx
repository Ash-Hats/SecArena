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
    <div className="min-h-screen bg-transparent text-[#FBFADA] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
