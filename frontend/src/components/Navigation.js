import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackPhoneClick } from '../utils/analytics';
import { ModeToggle } from './ModeToggle';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Truck, 
  Users, 
  Wrench, 
  BookOpen, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Phone,
  User,
  ChevronRight
} from 'lucide-react';

const PHONE_NUMBER = '+18005550199';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const primaryNavItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
    { path: '/intake', label: 'Intake', icon: <PlusCircle size={24} /> },
    { path: '/inventory', label: 'Inventory', icon: <Truck size={24} /> },
    { path: '/leads', label: 'Leads', icon: <Users size={24} /> },
  ];

  const secondaryNavItems = [
    { path: '/services', label: 'Services', icon: <Wrench size={20} /> },
    { path: '/resources', label: 'Resources', icon: <BookOpen size={20} /> },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────
          Desktop Top Navigation (lg and up)
          ────────────────────────────────────────────────────────────────────── */}
      <nav className="hidden lg:block bg-white dark:bg-slate-950 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-500 transition-colors">
                <span className="text-white text-xl font-bold">MS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Material Solutions</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Forklift Sales Machine</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex space-x-1">
              {allNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center space-x-2
                    ${isActive(item.path)
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-brand-600'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <a
                href={`tel:${PHONE_NUMBER}`}
                onClick={() => trackPhoneClick(PHONE_NUMBER)}
                className="hidden xl:flex items-center space-x-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors text-xs font-bold border border-brand-100 dark:border-brand-900/50"
              >
                <Phone size={14} />
                <span>{PHONE_NUMBER}</span>
              </a>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />
              
              <ModeToggle />
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-800 min-w-[44px] min-h-[44px] justify-center active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-400 text-sm font-bold border border-brand-200 dark:border-brand-800">
                    {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                        {user?.role}
                      </span>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 flex items-center space-x-2 transition-colors">
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 transition-colors mt-1"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────────
          Mobile Top Bar (below lg)
          ────────────────────────────────────────────────────────────────────── */}
      <nav className="lg:hidden bg-white dark:bg-slate-950 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-bold">MS</span>
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Material Solutions</h1>
          </Link>
          
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-900 text-gray-600 dark:text-gray-400 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────────
          Mobile Bottom Tab Bar (below lg)
          ────────────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {primaryNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1
                h-full transition-all duration-200 relative active:scale-90 touch-manipulation
                ${isActive(item.path)
                  ? 'text-brand-600'
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              <div className={`mb-1 transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold ${isActive(item.path) ? 'text-brand-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-b shadow-[0_1px_4px_rgba(0,0,0,0.3)]" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Mobile Menu Overlay (Sidebar)
          ────────────────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="lg:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-[60] shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      MS
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">Material Solutions</h2>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Forklift Sales</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
                {allNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center justify-between p-3 rounded-xl transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${isActive(item.path) ? 'text-brand-600' : 'text-gray-400'}`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive(item.path) ? 'text-brand-400' : 'text-gray-300'} />
                  </Link>
                ))}
                
                <div className="my-4 border-t border-gray-100 dark:border-slate-800 pt-4" />
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Support & Account</p>
                
                <button className="w-full flex items-center space-x-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                  <Settings size={20} className="text-gray-400" />
                  <span className="text-sm font-medium">Account Settings</span>
                </button>
                
                <a 
                  href={`tel:${PHONE_NUMBER}`}
                  className="w-full flex items-center space-x-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <Phone size={20} className="text-gray-400" />
                  <span className="text-sm font-medium">Call Support</span>
                </a>
              </div>

              {/* Logout at bottom */}
              <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
