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
          <p className="text-[#FBFADA]/80 leading-relaxed text-sm">
            SecArena is a highly interactive cyber warfare and penetration testing simulation environment.
            Our goal is to provide realistic, containerized training scenarios where students can practice 
            both offensive (Red Team) and defensive (Blue Team) skills.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5" /> Virtual Terminal
          </h2>
          <ul className="text-[#FBFADA]/80 text-sm space-y-2 list-disc list-inside">
            <li>Type <code className="bg-[#33503C] px-1 rounded">help</code> to see available commands.</li>
            <li>Use <code className="bg-[#33503C] px-1 rounded">echo</code> to write to files non-interactively.</li>
            <li>Standard utilities like <code className="bg-[#33503C] px-1 rounded">ls</code>, <code className="bg-[#33503C] px-1 rounded">cd</code>, and <code className="bg-[#33503C] px-1 rounded">grep</code> are supported.</li>
            <li>Use <code className="bg-[#33503C] px-1 rounded">hideflag</code> to secure your captured flags in PvP mode.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" /> PvP Mode
        </h2>
        <div className="text-[#FBFADA]/80 text-sm space-y-4 leading-relaxed">
          <p>
            In PvP (Player vs Player) mode, you can join a simulation room with other students. 
            Each player can choose to be on the <strong>Red Team</strong> or <strong>Blue Team</strong>.
          </p>
          <p>
            You can capture flags and submit them to earn points for your team. Use the 
            "Submit Captured Flag" input located below the terminal in your simulation view. 
            The history of all played rooms and scores will appear in your PvP History on the dashboard!
          </p>
        </div>
      </div>
    </motion.div>
  );
};
