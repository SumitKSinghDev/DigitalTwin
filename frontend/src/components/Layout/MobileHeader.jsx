import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { LogOut } from 'lucide-react';

const MobileHeader = ({ twinStatus }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Focused': return 'bg-primary';
      case 'Energetic': return 'bg-accent-emerald';
      case 'Strained': return 'bg-accent-amber';
      case 'Fatigued': return 'bg-orange-500';
      case 'Burned Out': return 'bg-accent-rose';
      default: return 'bg-accent-emerald';
    }
  };

  return (
    <header
      className={`md:hidden fixed top-0 left-0 right-0 h-14 border-b z-[100] flex items-center justify-between px-4 select-none shadow-sm transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white/80 border-slate-200/50 shadow-slate-200/20 text-slate-900 backdrop-blur-md'
          : 'bg-[#0a0c10]/80 border-zinc-900/60 shadow-black/40 text-zinc-100 backdrop-blur-md'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
        <Logo className="w-8 h-8" />
        <div className="flex flex-col">
          <h1 className="text-xs font-black tracking-wider brand-text-gradient uppercase leading-none">
            DIGITAL TWIN
          </h1>
          <p className="text-[7.5px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mt-0.5">
            STUDENT OS
          </p>
        </div>
      </div>

      {/* Settings / Controls */}
      <div className="flex items-center gap-3">
        {/* Compact Theme Toggle Switcher */}
        <ThemeToggle isMobile={true} />

        {/* User Profile avatar */}
        {user && (
          <div
            onClick={() => navigate('/')}
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-extrabold capitalize ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200/80 text-slate-700'
                  : 'bg-zinc-900 border-zinc-800/80 text-zinc-300'
              }`}
            >
              {user.username[0]}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                theme === 'light' ? 'border-white' : 'border-[#0a0c10]'
              } ${getStatusColor(twinStatus)}`}
            />
          </div>
        )}

        {/* Logout Trigger */}
        <button
          onClick={handleLogout}
          className={`p-1.5 rounded-lg border hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${
            theme === 'light'
              ? 'border-slate-200/80 text-slate-500 hover:text-red-600 hover:bg-red-50/50'
              : 'border-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-red-950/10'
          }`}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
