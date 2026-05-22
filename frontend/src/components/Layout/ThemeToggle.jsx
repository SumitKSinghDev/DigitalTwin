import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isCollapsed }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (isCollapsed) {
    return (
      <button
        onClick={toggleTheme}
        className="w-12 h-12 rounded-xl flex items-center justify-center border border-border bg-card hover:bg-card-hover text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 transition-all relative overflow-hidden group shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {/* Glow Trail on Hover for Collapsed Mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center z-10"
          >
            {theme === 'light' ? (
              <Sun size={20} className="text-amber-500 fill-amber-500/20" />
            ) : (
              <Moon size={20} className="text-indigo-400 fill-indigo-400/20" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <div className={`w-full p-1 rounded-xl flex items-center relative select-none transition-all duration-500 ${
      theme === 'light'
        ? 'bg-[#EEF2FF]/60 border border-indigo-100/60 shadow-inner'
        : 'bg-background/80 border border-border/80'
    }`}>
      <div className="relative flex w-full items-center p-0.5">
        {/* Dynamic Glow Trail (stretches/bounces during spring) */}
        <motion.div
          className={`absolute h-7 rounded-lg blur-sm opacity-30 pointer-events-none ${
            theme === 'light' ? 'bg-amber-400' : 'bg-indigo-500'
          }`}
          initial={false}
          animate={{
            width: '45%',
            x: theme === 'light' ? '4%' : '108%',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        />

        {/* Sliding Premium Orb Backdrop */}
        <motion.div
          className={`absolute h-8 rounded-lg border ${
            theme === 'light'
              ? 'bg-gradient-to-br from-white to-indigo-50/30 border-indigo-200/50 shadow-[0_3px_10px_rgba(99,102,241,0.12)]'
              : 'bg-card border-border/85 shadow-lg shadow-black/45'
          }`}
          initial={false}
          animate={{
            width: '48%',
            x: theme === 'light' ? '1%' : '101%',
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 21 }}
        />

        {/* Light Tab */}
        <button
          onClick={() => setTheme('light')}
          className={`flex-1 z-10 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer group ${
            theme === 'light' ? 'text-indigo-650' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <motion.div 
            animate={theme === 'light' ? { rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="group-hover:scale-110 transition-transform"
          >
            <Sun size={14} className={theme === 'light' ? 'text-amber-500 fill-amber-500/10' : ''} />
          </motion.div>
          <span>Light</span>
        </button>

        {/* Dark Tab */}
        <button
          onClick={() => setTheme('dark')}
          className={`flex-1 z-10 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer group ${
            theme === 'dark' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <motion.div
            animate={theme === 'dark' ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="group-hover:scale-110 transition-transform"
          >
            <Moon size={14} className={theme === 'dark' ? 'text-indigo-400 fill-indigo-400/10' : ''} />
          </motion.div>
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
