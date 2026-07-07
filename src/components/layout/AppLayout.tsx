import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AIAssistant } from '../AIAssistant';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showFooter = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 bg-grid-pattern transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-brand-100/30 dark:from-brand-950/15 via-transparent to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-accent-purple/10 dark:from-accent-purple/5 via-transparent to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className={`flex-1 flex flex-col ${user ? 'pb-24 md:pb-6' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};
