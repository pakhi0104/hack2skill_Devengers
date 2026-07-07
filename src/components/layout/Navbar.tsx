import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../hooks';
import { ThemeToggle } from '../ui/ThemeToggle';
import { 
  LayoutDashboard, 
  Bookmark, 
  FileSpreadsheet, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { success, error } = useToast();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error: err } = await signOut();
    if (err) {
      error('Sign Out Failed', err);
    } else {
      success('Signed Out Successfully', 'Come back soon!');
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Saved Schemes', path: '/saved-schemes', icon: Bookmark },
    { name: 'Applications', path: '/applications', icon: FileSpreadsheet },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-brand-500/10">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                SchemeMatch AI
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5 select-none">
                Don't Search. Get Matched.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Link Tabs */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 font-sans
                      ${active 
                        ? 'text-brand-600 dark:text-brand-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                      }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-brand-50 dark:bg-brand-950/30 rounded-xl -z-10 border border-brand-100/30 dark:border-brand-900/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="relative">
                      <IconComponent className="w-4 h-4" />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Header Panel Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <>
                {/* Desktop Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all font-sans"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

                {/* Mobile Menu Icon */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-sm transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-sm shadow-brand-500/15 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Collapsible list navigation) */}
      <AnimatePresence>
        {user && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950 z-30 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 z-40 md:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Profile Brief in Drawer */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-accent-purple flex items-center justify-center text-white font-bold">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-950 dark:text-white truncate">
                      {profile?.name || 'Loading User...'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {profile?.email || user.email}
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all
                          ${active 
                            ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <IconComponent className="w-4 h-4" />
                            {item.badge && item.badge > 0 && (
                              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </div>
                          {item.name}
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-55" />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Logout Button in Drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/10 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-sans"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation for Mobile (Only for Logged in Users) */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 pointer-events-none">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
            className="pointer-events-auto max-w-md mx-auto glassmorphism bg-white/70 dark:bg-slate-950/70 border border-white/30 dark:border-white/10 rounded-2xl shadow-premium px-4 py-2.5 flex items-center justify-around"
          >
            {navItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative
                    ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-tight font-sans">
                    {item.name.split(' ')[0]}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="activeBottomIndicator"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-brand-500"
                    />
                  )}
                </Link>
              );
            })}
            
            <Link
              to="/settings"
              className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative
                ${isActive('/settings') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-tight font-sans">
                Settings
              </span>
              {isActive('/settings') && (
                <motion.div
                  layoutId="activeBottomIndicator"
                  className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-brand-500"
                />
              )}
            </Link>
          </motion.div>
        </div>
      )}
    </>
  );
};
