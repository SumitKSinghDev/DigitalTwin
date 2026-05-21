import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Target, 
  Sparkles, 
  LogOut, 
  BrainCircuit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ twinStatus, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
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
    <aside className={`h-screen fixed left-0 top-0 glass-panel border-r border-zinc-800/80 flex flex-col justify-between py-6 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-20 px-3' : 'w-64 px-4'
    }`}>
      {/* Floating Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-4 top-8 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-md z-30 group cursor-pointer hover:bg-zinc-800 hover:scale-105"
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
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-primary glow-mesh-title flex-shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              DIGITAL TWIN
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Student Core</p>
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
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-600/5'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
                {item.name}
              </span>
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-950/95 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-30">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer Panel */}
      <div className={`flex flex-col gap-4 border-t border-zinc-800/80 pt-6 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
        {user && (
          <div className={`flex items-center justify-between px-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {/* Visual indicator orb */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-zinc-700 bg-zinc-900 capitalize text-zinc-200`}>
                  {user.username[0]}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(twinStatus)}`} />
              </div>
              <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
                <span className="text-sm font-medium text-zinc-200 truncate max-w-[120px]">{user.username}</span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">{twinStatus || 'Syncing...'}</span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`relative group flex items-center gap-3 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent hover:border-zinc-800/80 transition-all duration-200 ${
            isCollapsed ? 'px-0 justify-center w-10 h-10' : 'px-4 w-full'
          }`}
        >
          <LogOut className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'} whitespace-nowrap`}>
            Logout
          </span>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-950/95 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-30">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
