import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const { success, error } = useToast();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    if (!email) {
      setEmailError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error: err } = await forgotPassword(email);
      if (err) {
        error('Reset Link Failed', err);
      } else {
        success('Link Sent!', `A password reset link has been dispatched to ${email}`);
        setIsSent(true);
      }
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
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-premium" hoverable={false} animate={false}>
            {/* Back to Login Header */}
            <div className="mb-6 flex select-none">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans">
                Get a secure magic link to reset your account password
              </p>
            </div>

            {isSent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-accent-emerald flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-6 h-6 animate-pulse-subtle" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xs mx-auto">
                  We have dispatched detailed instructions to <span className="font-semibold text-slate-700 dark:text-slate-350">{email}</span>. Click the link inside the mail to reset.
                </p>
                <div className="pt-4 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSent(false)}
                  >
                    Resend Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  error={emailError}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  className="w-full mt-6 py-2.5"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
