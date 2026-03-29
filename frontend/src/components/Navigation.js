import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Mail,
  User,
  ChevronRight,
  ChevronDown,
  GitBranch
} from 'lucide-react';

const BILL_EMAIL = 'bwhite@materialsolutions.com';
const CHRIS_EMAIL = 'chris@vortexventures.com';

const EMAIL_OPTIONS = [
  { key: 'bill', label: 'Email Bill', email: BILL_EMAIL },
  { key: 'chris', label: 'Email Chris', email: CHRIS_EMAIL },
  { key: 'both', label: 'Email Both', email: `${BILL_EMAIL},${CHRIS_EMAIL}` },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [emailPref, setEmailPref] = useState(() => localStorage.getItem('ms-email-pref') || 'bill');
  const [showEmailMenu, setShowEmailMenu] = useState(false);

  const selectedEmail = EMAIL_OPTIONS.find((o) => o.key === emailPref) || EMAIL_OPTIONS[0];

  const handleEmailPrefChange = (key) => {
    setEmailPref(key);
    localStorage.setItem('ms-email-pref', key);
    setShowEmailMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const primaryNavItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/intake', label: 'Intake', icon: <PlusCircle size={20} /> },
    { path: '/inventory', label: 'Inventory', icon: <Truck size={20} /> },
    { path: '/pipeline', label: 'Pipeline', icon: <GitBranch size={20} /> },
    { path: '/leads', label: 'Leads', icon: <Users size={20} /> },
  ];

  const secondaryNavItems = [
    { path: '/services', label: 'Services', icon: <Wrench size={18} /> },
    { path: '/resources', label: 'Resources', icon: <BookOpen size={18} /> },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden lg:block bg-card/90 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Vortex Ventures Branding */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center shadow-md shadow-neon-cyan/20 group-hover:shadow-lg group-hover:shadow-neon-cyan/40 transition-all duration-300">
                <span className="text-white text-base font-bold tracking-tight">MS</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">Material Solutions Forklift Sales Machine</h1>
                <p className="text-xs text-neon-cyan/70 uppercase tracking-[0.15em] font-semibold whitespace-nowrap">A Vortex Ventures Product</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {allNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    flex items-center gap-2
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan shadow-glow border border-neon-cyan/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Email Toggle Dropdown */}
              <div className="relative hidden xl:block">
                <button
                  onClick={() => setShowEmailMenu(!showEmailMenu)}
                  onBlur={() => setTimeout(() => setShowEmailMenu(false), 200)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/10 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-all text-xs font-semibold hover:shadow-glow"
                >
                  <Mail size={14} />
                  <span>{selectedEmail.label}</span>
                  <ChevronDown size={12} className={`transition-transform ${showEmailMenu ? 'rotate-180' : ''}`} />
                </button>

                {showEmailMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-card rounded-xl shadow-premium-hover border border-border/50 py-1 z-50 animate-in fade-in zoom-in duration-200 origin-top-right backdrop-blur-xl">
                    {EMAIL_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleEmailPrefChange(option.key)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                          emailPref === option.key
                            ? 'text-neon-cyan bg-neon-cyan/10'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Mail size={13} />
                        {option.label}
                      </button>
                    ))}
                    <div className="border-t border-border/50 mt-1 pt-1">
                      <a
                        href={`mailto:${selectedEmail.email}`}
                        className="w-full text-left px-3 py-2 text-sm text-neon-green hover:bg-neon-green/10 flex items-center gap-2 transition-colors"
                      >
                        <Mail size={13} />
                        Send Now
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-border" />

              <ModeToggle />

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-all min-w-[44px] min-h-[44px] justify-center active:scale-[0.97]"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-neon-cyan/20">
                    {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-premium-hover border border-border/50 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-border/50 mb-1">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold uppercase tracking-wider">
                        {user?.role}
                      </span>
                    </div>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 transition-colors rounded-lg mx-0">
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors rounded-lg mt-1"
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="lg:hidden bg-card/90 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center shadow-md shadow-neon-cyan/20">
              <span className="text-white text-sm font-bold">MS</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Sales Machine</h1>
              <p className="text-[9px] text-neon-cyan/70 uppercase tracking-wider font-semibold whitespace-nowrap">A Vortex Ventures Product</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <ModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {primaryNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1
                h-full transition-all duration-200 relative active:scale-90 touch-manipulation
                ${isActive(item.path)
                  ? 'text-neon-cyan'
                  : 'text-muted-foreground'
                }
              `}
            >
              <div className={`mb-1 transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-semibold ${isActive(item.path) ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon-cyan rounded-b shadow-glow" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay (Sidebar) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="lg:hidden fixed top-0 right-0 bottom-0 w-[300px] bg-card z-[60] shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border/50">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-neon-cyan/20">
                      MS
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-base">Sales Machine</h2>
                      <p className="text-xs text-neon-cyan/70 uppercase tracking-[0.15em] font-semibold whitespace-nowrap">A Vortex Ventures Product</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold shadow-sm shadow-neon-cyan/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">Main Menu</p>
                {allNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center justify-between p-3 rounded-xl transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive(item.path) ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive(item.path) ? 'text-neon-cyan' : 'text-muted-foreground/40'} />
                  </Link>
                ))}

                <div className="my-4 border-t border-border/50 pt-4" />
                <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">Support & Account</p>

                <button className="w-full flex items-center gap-3 p-3 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors">
                  <Settings size={18} />
                  <span className="text-sm font-medium">Account Settings</span>
                </button>

                <a
                  href={`mailto:${selectedEmail.email}`}
                  className="w-full flex items-center gap-3 p-3 text-neon-cyan hover:bg-neon-cyan/10 rounded-xl transition-colors"
                >
                  <Mail size={18} />
                  <span className="text-sm font-medium">{selectedEmail.label}</span>
                </a>
              </div>

              <div className="p-4 border-t border-border/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
                >
                  <LogOut size={18} />
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
