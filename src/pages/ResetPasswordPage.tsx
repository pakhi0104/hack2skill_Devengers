import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResetPasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Supabase sends the access_token in the URL hash after the magic link click.
  // We set the session from the hash so the user is authenticated for the update.
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession(); // triggers session from hash automatically
    }
  }, []);

  const validate = () => {
    let valid = true;
    setPasswordError('');
    setConfirmError('');

    if (!password) {
      setPasswordError('New password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          error('Reset Failed', updateError.message);
          setIsLoading(false);
          return;
        }
      } else {
        // Mock mode: just simulate a delay
        await new Promise((r) => setTimeout(r, 800));
      }

      success('Password Updated', 'Your password has been reset. You can now sign in.');
      setIsDone(true);
    } catch (err: any) {
      error('An error occurred', err.message || 'Please try again.');
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
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-premium" hoverable={false} animate={false}>
            {/* Back link */}
            {!isDone && (
              <div className="mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors font-sans"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            )}

            {isDone ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-accent-emerald" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Password Reset!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Your account password has been updated successfully.
                </p>
                <Button
                  className="w-full mt-4"
                  onClick={() => navigate('/login')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In Now
                </Button>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans">
                    Choose a strong password for your SchemeMatch account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    error={passwordError}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    error={confirmError}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full mt-6 py-2.5"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Reset Password
                  </Button>
                </form>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
