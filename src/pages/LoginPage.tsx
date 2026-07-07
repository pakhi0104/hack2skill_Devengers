import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { signIn, isMockMode } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email address is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        error('Login Failed', err);
      } else {
        success('Welcome Back!', 'Redirecting to your dashboard...');
        navigate('/dashboard');
      }
    } catch (err: any) {
      error('An error occurred', err.message || 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {isMockMode && (
            <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs flex gap-2.5 font-sans leading-relaxed shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold">Sandbox Mock Mode Enabled:</span> Register any email & password locally to access the dashboard instantly! Supabase variables can be added to `.env` to connect to a live DB.
              </div>
            </div>
          )}

          <Card className="p-8 shadow-premium" hoverable={false} animate={false}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sign In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans">
                Access your personalized SchemeMatch advisor portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center select-none">
                  <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-brand-500 hover:text-brand-600 hover:underline transition-colors font-sans"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 py-2.5"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Bottom Links */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/40 text-center select-none">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
