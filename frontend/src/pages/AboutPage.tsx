import React from 'react';
import { Info, BookOpen, Terminal, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 border-b border-[#33503C]/30 pb-6">
        <div className="p-4 rounded-2xl bg-[#33503C]/20 border border-[#33503C]/40 text-[#FBFADA]">
          <Info className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#FBFADA] tracking-tight">About SecArena</h1>
          <p className="text-[#FBFADA]/70 mt-1">Platform Documentation & Guide</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" /> Platform Overview
          </h2>
          <p className="text-[#FBFADA]/80 leading-relaxed text-sm mb-4">
            SecArena is a highly interactive cyber warfare and penetration testing simulation environment.
            You can practice your skills in standalone scenarios or compete against other players in real-time PvP matches.
          </p>
          <h3 className="text-[#FBFADA] font-bold text-sm mb-2">How to Play:</h3>
          <ul className="text-[#FBFADA]/80 text-sm space-y-2 list-disc list-inside">
            <li><strong>Simulator:</strong> Play solo scenarios. Use the terminal to navigate the system, find vulnerabilities, and discover the hidden <code className="bg-[#33503C] px-1 rounded">SEC_ARENA&#123;...&#125;</code> flag to win.</li>
            <li><strong>PvP Mode:</strong> Create or join multiplayer lobbies using a 6-character Join Code. Compete as either Red or Blue team.</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5" /> Virtual Terminal
          </h2>
          <p className="text-[#FBFADA]/80 leading-relaxed text-sm mb-4">
            The heart of SecArena is the simulated terminal. It provides a sandboxed filesystem for you to execute commands.
          </p>
          <ul className="text-[#FBFADA]/80 text-sm space-y-2 list-disc list-inside">
            <li>Navigate using standard commands: <code className="bg-[#33503C] px-1 rounded">cd</code>, <code className="bg-[#33503C] px-1 rounded">ls</code>, <code className="bg-[#33503C] px-1 rounded">pwd</code>.</li>
            <li>Read files and search text: <code className="bg-[#33503C] px-1 rounded">cat</code>, <code className="bg-[#33503C] px-1 rounded">grep</code>, <code className="bg-[#33503C] px-1 rounded">find</code>.</li>
            <li>Create or delete files: <code className="bg-[#33503C] px-1 rounded">touch</code>, <code className="bg-[#33503C] px-1 rounded">mkdir</code>, <code className="bg-[#33503C] px-1 rounded">echo</code>, <code className="bg-[#33503C] px-1 rounded">rm</code>.</li>
            <li>Use <code className="bg-[#33503C] px-1 rounded">clear</code> to clean your terminal output at any time.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" /> PvP Mode Strategy Guide
        </h2>
        <div className="text-[#FBFADA]/80 text-sm space-y-4 leading-relaxed">
          <p>
            <strong>Blue Team (Defenders):</strong> Your primary objective is to hide flags securely in the virtual filesystem. 
            Use the "Action Center" on the right side of the dashboard, or type <code className="bg-[#33503C] px-1 rounded">hideflag /path/to/file SEC_ARENA&#123;flag_name&#125;</code> in the terminal to securely inject flags into the filesystem. Try to hide them in obscure directories to buy time!
          </p>
          <p>
            <strong>Red Team (Attackers):</strong> Your objective is to hunt down the flags hidden by the Blue Team. 
            Use search commands like <code className="bg-[#33503C] px-1 rounded">find</code> and <code className="bg-[#33503C] px-1 rounded">grep</code> to sweep the filesystem. Once you find a flag string in the terminal, copy it and paste it into your "Action Center" to capture it and score points.
          </p>
          <p>
            The team with the most points when the host ends the match wins.
          </p>
        </div>
      </div>

      {/* Watermark */}
      <div className="pt-12 pb-4 text-center">
        <p className="text-[#FBFADA]/30 text-xs font-mono tracking-widest uppercase font-bold mb-2">
          Project Team
        </p>
        <p className="text-[#FBFADA]/50 text-sm">
          Shivani Barskar • Rohit Soni
        </p>
        <p className="text-[#FBFADA]/40 text-xs mt-2">
          Guided by: Vijay Mandle
        </p>
      </div>
    </motion.div>
  );
};
