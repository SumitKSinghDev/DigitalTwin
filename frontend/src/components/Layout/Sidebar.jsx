import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Target, 
  Sparkles, 
  MessageSquare,
  LogOut, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ twinStatus, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Talk to Twin', path: '/talk', icon: MessageSquare },
    { name: 'Daily Tracker', path: '/tracker', icon: ClipboardList },
    { name: 'Analytics Hub', path: '/analytics', icon: BarChart3 },
    { name: 'Goals Board', path: '/goals', icon: Target },
    { name: 'AI Twin Deep-Dive', path: '/insights', icon: Sparkles },
  ];

  // Helper to color-code the sidebar twin status dot
  const getStatusColor = (status) => {
    switch (status) {
      case 'Focused': return 'bg-primary text-primary';
      case 'Energetic': return 'bg-accent-emerald text-accent-emerald';
      case 'Strained': return 'bg-accent-amber text-accent-amber';
      case 'Fatigued': return 'bg-orange-500 text-orange-500';
      case 'Burned Out': return 'bg-accent-rose text-accent-rose animate-ping';
      default: return 'bg-accent-emerald text-accent-emerald';
    }
  };

  return (
    <aside className={`h-screen fixed left-0 top-0 sidebar-glass flex flex-col justify-between py-6 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-20 px-3' : 'w-64 px-4'
    }`}>
      {/* Floating Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-4 top-8 w-8 h-8 rounded-full bg-card border border-border hover:border-indigo-500/50 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-all shadow-md z-30 group cursor-pointer hover:bg-bg-secondary hover:scale-105"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
      </button>

      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className={`flex items-center gap-3 px-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0">
            <Logo className="w-9 h-9" />
          </div>
          <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
            <h1 className="text-base font-bold tracking-tight brand-text-gradient">
              DIGITAL TWIN
            </h1>
            <p className="text-[9px] text-text-muted uppercase tracking-widest font-extrabold">STUDENT OS</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative group flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? 'px-0 justify-center' : 'px-4'
                } ${
                  isActive
                    ? (theme === 'light'
                        ? 'sidebar-nav-active'
                        : 'bg-indigo-650/15 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-600/5 font-semibold')
                    : (theme === 'light'
                        ? 'text-[#475569] hover:text-[#4F46E5] hover:bg-[rgba(99,102,241,0.06)] border border-transparent'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 border border-transparent')
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
                {item.name}
              </span>
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-30">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer Panel */}
      <div className={`flex flex-col gap-4 border-t border-border/80 pt-6 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
        {user && (
          <div className={`transition-all duration-300 ${
            isCollapsed 
              ? 'p-0 bg-transparent border-transparent w-full flex justify-center' 
              : 'mx-1 p-2.5 rounded-xl border border-border/60 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md shadow-sm hover:shadow-md hover:border-indigo-500/20 hover:scale-[1.01] transition-all duration-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {/* Visual indicator orb */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-border bg-bg-secondary capitalize text-slate-700 dark:text-zinc-200`}>
                  {user.username[0]}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(twinStatus)}`} />
              </div>
              <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-200 truncate max-w-[120px]">{user.username}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{twinStatus || 'Syncing...'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Premium Theme Switcher Capsule */}
        <div className={`px-2 w-full flex justify-center`}>
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
        
        <button
          onClick={handleLogout}
          className={`relative group flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            isCollapsed ? 'px-0 justify-center w-10 h-10' : 'px-4 w-full'
          } ${
            theme === 'light'
              ? 'text-[#64748B] hover:text-[#DC2626] hover:bg-[rgba(239,68,68,0.06)] border border-transparent hover:scale-[1.02]'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-transparent'
          }`}
        >
          <LogOut className={`w-4 h-4 flex-shrink-0 transition-colors ${
            theme === 'light'
              ? 'text-[#64748B] group-hover:text-[#DC2626]'
              : 'text-zinc-500 group-hover:text-zinc-100'
          }`} />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
            Logout
          </span>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-30">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
