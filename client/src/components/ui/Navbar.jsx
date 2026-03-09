import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain, LayoutDashboard, FileText, History, Shield, LogOut, Menu, X, Mic } from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/interview/new', label: 'New Interview', icon: Mic },
  { to: '/resume', label: 'Resume AI', icon: FileText },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center group-hover:bg-violet-400 transition-colors">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Interview<span className="text-violet-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin') ? 'bg-amber-500/20 text-amber-300' : 'text-white/60 hover:text-amber-400 hover:bg-amber-500/10'
                }`}>
                <Shield className="w-4 h-4" />Admin
              </Link>
            )}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-white/80 font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(to) ? 'bg-violet-500/20 text-violet-300' : 'text-white/60 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 w-full">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      )}
    </nav>
  );
}
