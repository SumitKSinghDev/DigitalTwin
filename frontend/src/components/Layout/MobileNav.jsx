import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { 
  LayoutDashboard, 
  MessageSquare,
  ClipboardList, 
  BarChart3, 
  Target, 
  Sparkles 
} from 'lucide-react';

const MobileNav = () => {
  const { theme } = useTheme();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Talk', path: '/talk', icon: MessageSquare },
    { name: 'Log', path: '/tracker', icon: ClipboardList },
    { name: 'Charts', path: '/analytics', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'AI', path: '/insights', icon: Sparkles },
  ];

  return (
    <nav 
      className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t backdrop-blur-lg z-50 flex items-center justify-around px-2 pb-safe select-none shadow-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white/80 border-slate-200/60 shadow-slate-200/40 text-slate-600'
          : 'bg-zinc-950/80 border-zinc-900/60 shadow-black/80 text-zinc-400'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative group active:scale-95 ${
                isActive
                  ? (theme === 'light'
                      ? 'text-[#4F46E5] font-bold scale-105'
                      : 'text-indigo-400 font-bold scale-105')
                  : (theme === 'light'
                      ? 'text-slate-400 hover:text-slate-650'
                      : 'text-zinc-500 hover:text-zinc-300')
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105" />
                <span className="text-[7.5px] uppercase tracking-widest font-black mt-0.5 select-none opacity-90 leading-none">
                  {item.name}
                </span>
                
                {/* Active Indicator Micro-Glow Dot */}
                {isActive && (
                  <span 
                    className={`absolute bottom-0.5 w-1 h-1 rounded-full animate-pulse ${
                      theme === 'light' ? 'bg-[#4F46E5] shadow-[0_0_8px_#4F46E5]' : 'bg-indigo-400 shadow-[0_0_8px_#818CF8]'
                    }`}
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
