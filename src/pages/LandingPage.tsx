import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Sparkles, 
  Search, 
  Map, 
  CheckSquare, 
  Activity, 
  Zap, 
  ChevronDown, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Testimonials
const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Agricultural Entrepreneur',
    content: 'SchemeMatch AI matched me with the PM Kisan Samman Nidhi and a state subsidy for solar pumps in less than 2 minutes. The documentation checklist saved me weeks of office visits.',
    avatar: 'RK'
  },
  {
    name: 'Aanya Sharma',
    role: 'B.Tech Student, EWS Category',
    content: 'I had no idea I was eligible for three different national and state-level scholarships. This tool found them and guided me on how to apply step-by-step. Absolutely brilliant!',
    avatar: 'AS'
  },
  {
    name: 'Vikram Aditya',
    role: 'Tech Startup Founder',
    content: 'For young businesses, navigating MSME schemes is a nightmare. SchemeMatch cut through the noise and matched us with the Startup India Seed Fund. Highly recommend!',
    avatar: 'VA'
  }
];

// FAQ list
const faqs = [
  {
    q: 'How does SchemeMatch AI work?',
    a: 'Once you sign up and configure your demographic profile (state, income, occupation, category), our system filters through thousands of state and central schemes to present you with only the schemes you qualify for. No more browsing through endless text documents.'
  },
  {
    q: 'Is my data safe and secure?',
    a: 'Absolutely. We enforce Row Level Security (RLS) on all user data. Your profile parameters (income, category, etc.) are strictly private, stored securely in Supabase, and can only be accessed by you.'
  },
  {
    q: 'Are the schemes updated in real-time?',
    a: 'Yes, we track official state, central, and banking portals. The matches and deadlines you see are cross-referenced with official sources, maintaining 100% transparency.'
  },
  {
    q: 'Can I track my application status here?',
    a: 'In Phase 1, we offer custom UI tracker cards to log your progress manually. In Phase 2, we will integrate automated application roadmaps and real-time status updates.'
  }
];

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'AI Personalized Matching',
      desc: 'Get instantly matched with schemes tailored to your exact age, occupation, income, and category.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Official Scheme Discovery',
      desc: 'Explore central and state schemes derived only from authenticated official government databases.',
      icon: Search,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Application Roadmaps',
      desc: 'Understand exactly how to apply with visual, step-by-step journey timelines for every benefit.',
      icon: Map,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Document Checklist',
      desc: 'Clear, compiled list of required documents (Aadhaar, income certificate, etc.) before you apply.',
      icon: CheckSquare,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Application Tracker',
      desc: 'Log and track all your ongoing government benefits applications inside a single portal.',
      icon: Activity,
      color: 'from-pink-500/20 to-red-500/20 text-pink-600 dark:text-pink-400'
    },
    {
      title: 'Real-time Recommendations',
      desc: 'Instant updates on new scholarships, funding opportunities, or welfare benefits as soon as they open.',
      icon: Zap,
      color: 'from-teal-500/20 to-mint-500/20 text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <AppLayout showFooter={true}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-28 overflow-hidden text-center max-w-7xl mx-auto px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-brand-300/10 dark:from-brand-900/10 to-transparent blur-3xl -z-10" />
        
        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/5 text-brand-600 dark:text-brand-400 border border-brand-500/25 text-xs font-bold font-sans tracking-wide mb-6 select-none"
        >
          <Sparkles className="w-3.5 h-3.5 animate-float" />
          <span>Don't Search. Get Matched.</span>
        </motion.div>

        {/* Hero Headings */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight"
        >
          Personalized Government Benefit Matches{' '}
          <span className="bg-gradient-to-r from-brand-500 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Powered by AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans"
        >
          Discover official government schemes, scholarships, loans, and subsidies matching your exact demographic and professional profile. Instantly.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started Free
            </Button>
          </Link>
          <a href="#features">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/20 dark:bg-slate-900/10 border-y border-slate-200/40 dark:border-slate-800/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Schemes Discoverable', desc: 'Central & State benefits', icon: Globe2 },
              { value: '500+', label: 'Government Benefits', desc: 'Active financial aids matched daily', icon: TrendingUp },
              { value: '100%', label: 'Official Sources Only', desc: 'Direct verify from ministries', icon: ShieldCheck },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center p-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-3 shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mt-2 font-sans">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    {stat.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Designed for Instant Discovery
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            Skip reading hundreds of governmental guidelines. Our intelligent filters map your profile parameters to official eligibility rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="group cursor-default relative overflow-hidden" hoverable animate>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-brand-200/20 dark:from-brand-900/15 via-transparent to-transparent pointer-events-none rounded-full blur-xl transition-all duration-300 group-hover:scale-125" />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white/10 dark:bg-slate-950/10 border-t border-slate-200/30 dark:border-slate-800/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trusted by Citizens Nationwide
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-sans">
              Hear from students, farmers, and business owners who have discovered their rightful benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <Card key={idx} className="flex flex-col justify-between" hoverable={false} animate={false}>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans italic">
                    "{test.content}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-accent-purple flex items-center justify-center text-white font-bold text-xs select-none">
                    {test.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white font-sans leading-none">
                      {test.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block leading-none font-sans">
                      {test.role}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-sans">
            Need clarification? Here are quick answers to common inquiries.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glassmorphism rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-slate-900 dark:text-white font-semibold text-sm focus:outline-none transition-colors hover:bg-white/30 dark:hover:bg-slate-900/20"
                >
                  <span className="font-sans">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans border-t border-slate-100/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
};
