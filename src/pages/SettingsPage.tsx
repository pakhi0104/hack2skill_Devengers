import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { 
  useSearchHistory, 
  useSavedSchemes 
} from '../hooks';
import { AppLayout } from '../components/layout/AppLayout';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  Trash2, 
  LogOut, 
  ShieldAlert, 
  Settings,
  History,
  Bookmark,
  Globe,
  Save,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { success, info, error } = useToast();
  const { clearHistory } = useSearchHistory();
  const { clearSavedSchemes } = useSavedSchemes();
  const navigate = useNavigate();

  // Dialog open state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);
  const [clearSavedModalOpen, setClearSavedModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle options state
  const [notifsEmail, setNotifsEmail] = useState(true);
  const [notifsPush, setNotifsPush] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleLogout = async () => {
    const { error: err } = await signOut();
    if (err) {
      error('Sign Out Failed', err);
    } else {
      success('Logged Out', 'Hope to see you back soon!');
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Simulate API delay for deleting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDeleting(false);
    setDeleteModalOpen(false);
    
    // Clear out everything and redirect
    localStorage.clear();
    success('Account Deleted', 'Your account and cached profile details have been erased.');
    window.location.href = '/';
  };

  const handleClearSearchHistory = async () => {
    await clearHistory();
    setClearHistoryModalOpen(false);
    success('Search History Cleared', 'Your search history has been erased.');
  };

  const handleClearSavedSchemes = async () => {
    await clearSavedSchemes();
    setClearSavedModalOpen(false);
    success('Saved Schemes Cleared', 'Your saved schemes have been erased.');
  };

  const toggleNotifs = (type: 'email' | 'push') => {
    if (type === 'email') {
      setNotifsEmail(!notifsEmail);
      success('Settings Updated', `Email alerts ${!notifsEmail ? 'enabled' : 'disabled'}`);
    } else {
      setNotifsPush(!notifsPush);
      success('Settings Updated', `Push notifications ${!notifsPush ? 'enabled' : 'disabled'}`);
    }
  };

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-8 select-none">
          Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* SETTINGS MENU TABS (Left column) */}
          <div className="md:col-span-4 space-y-3.5 select-none">
            <Sidebar
              title="Settings Menu"
              items={[
                { name: 'General', path: '/settings', icon: Settings },
                {
                  name: 'Privacy & Security', path: '/settings', icon: Lock },
                {
                  name: 'Data Management', path: '/settings', icon: Save },
              ]}
            />
          </div>

          {/* MAIN SETTINGS CARDS (Right column) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Visual Customization Card */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <Sun className="w-4.5 h-4.5 text-brand-500" />
                Appearance Theme
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'light', label: 'Light', icon: Sun },
                  { name: 'dark', label: 'Dark', icon: Moon },
                  { name: 'system', label: 'System', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = theme === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setTheme(item.name as any)}
                      className={`py-4 px-3 flex flex-col items-center gap-2 rounded-xl border font-sans text-xs font-bold transition-all focus:outline-none
                        ${active 
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 text-brand-500 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Notifications Configuration Card */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <Bell className="w-4.5 h-4.5 text-brand-500" />
                Notifications Preferences
              </h3>

              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Alert me on application deadlines and matching scheme changes.', state: notifsEmail },
                  { id: 'push', label: 'Push Notifications', desc: 'Direct in-browser alerts for critical reminders and documents checklist.', state: notifsPush }
                ].map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between gap-6 py-1 select-none">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {notif.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 leading-normal">
                        {notif.desc}
                      </p>
                    </div>

                    {/* Styled Toggle Switch */}
                    <button
                      onClick={() => toggleNotifs(notif.id as any)}
                      className={`relative w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0
                        ${notif.state ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow-md"
                        animate={{ x: notif.state ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <Lock className="w-4.5 h-4.5 text-brand-500" />
                Privacy & Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-6 py-1 select-none">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Privacy Mode
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 leading-normal">
                      Keep your profile and activity data anonymous from analytics.
                    </p>
                  </div>
                  <button
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0
                      ${privacyMode ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                      animate={{ x: privacyMode ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <Save className="w-4.5 h-4.5 text-brand-500" />
                Data Management
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setClearHistoryModalOpen(true)}
                  leftIcon={<History className="w-4 h-4" />}
                >
                  Clear Search History
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setClearSavedModalOpen(true)}
                  leftIcon={<Bookmark className="w-4 h-4" />}
                >
                  Clear Saved Schemes
                </Button>
              </div>
            </Card>

            {/* Account Settings Panel */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <Settings className="w-4.5 h-4.5 text-slate-500" />
                System Management
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
                  className="flex-1 text-red-500 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Logout Session
                </Button>
                
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setDeleteModalOpen(true)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="flex-1"
                >
                  Delete Profile
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </div>

      {/* Delete Account confirmation Drawer (Modal Dialog) */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Profile Erase"
        size="sm"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse-subtle" />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Are you absolutely sure?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-sans">
              This action will completely delete your credentials, matching settings, saved items, and clear all details from the database. It cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 mt-6 border-t border-slate-100/10 pt-4 select-none">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Keep Profile
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Erase Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear Search History confirmation */}
      <Modal
        isOpen={clearHistoryModalOpen}
        onClose={() => setClearHistoryModalOpen(false)}
        title="Clear Search History"
        size="sm"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Clear Search History?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-sans">
              This will delete all your saved search history. This cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 mt-6 border-t border-slate-100/10 pt-4 select-none">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setClearHistoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleClearSearchHistory}
            >
              Clear History
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear Saved Schemes confirmation */}
      <Modal
        isOpen={clearSavedModalOpen}
        onClose={() => setClearSavedModalOpen(false)}
        title="Clear Saved Schemes"
        size="sm"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Clear Saved Schemes?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-sans">
              This will remove all your saved schemes. This cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 mt-6 border-t border-slate-100/10 pt-4 select-none">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setClearSavedModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleClearSavedSchemes}
            >
              Clear Saved Schemes
            </Button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  );
};
