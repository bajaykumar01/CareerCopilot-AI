import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Award, Mic, LogOut, Briefcase } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Recommendations', path: '/recommendations', icon: Award },
    { name: 'Mock Interview', path: '/interview', icon: Mic },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111827]/80 border-r border-slate-800/60 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg shadow-brand-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
              CareerCopilot
            </h1>
            <span className="text-[10px] text-brand-500 font-semibold tracking-wider uppercase">AI Suite v2</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border-l-4 border-brand-500 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-850 border border-slate-800/30">
            <div className="flex flex-col truncate pr-2">
              <span className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Candidate'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-[#111827]/85 border-b border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-1.5 rounded-lg text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <h1 className="text-md font-bold tracking-tight bg-gradient-to-r from-white to-brand-400 bg-clip-text text-transparent">
              CareerCopilot
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Slots */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
