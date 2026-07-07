import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useSearchHistory,
  useSavedSchemes,
  useApplications,
  useNotifications
} from '../hooks';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import {
  GraduationCap,
  Landmark,
  Home,
  Rocket,
  Sprout,
  Heart,
  Briefcase,
  UserCheck,
  Bookmark,
  Calendar,
  ArrowRight,
  History,
  ClipboardList,
  Sparkles,
  TrendingUp,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { history: searchHistoryEntries } = useSearchHistory();
  const { savedSchemes, loading: savedLoading } = useSavedSchemes();
  const { applications, loading: appsLoading } = useApplications();
  const { notifications, unreadCount } = useNotifications();

  const userName = profile?.name || 'User';

  const categories = [
    { name: 'Scholarships', icon: GraduationCap, color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400' },
    { name: 'Education Loans', icon: Landmark, color: 'from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400' },
    { name: 'Housing', icon: Home, color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400' },
    { name: 'Startup', icon: Rocket, color: 'from-pink-500/10 to-purple-500/10 text-pink-600 dark:text-pink-400' },
    { name: 'Agriculture', icon: Sprout, color: 'from-emerald-500/10 to-green-500/10 text-green-600 dark:text-green-400' },
    { name: 'Women Welfare', icon: Heart, color: 'from-red-500/10 to-rose-500/10 text-rose-600 dark:text-rose-400' },
    { name: 'Employment', icon: Briefcase, color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400' },
    { name: 'Senior Citizen', icon: UserCheck, color: 'from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400' },
  ];

  const recommendedCategories = profile?.occupation === 'Student'
    ? ['Scholarships', 'Education Loans', 'Employment']
    : profile?.occupation === 'Farmer'
      ? ['Agriculture', 'Housing', 'Employment']
      : profile?.occupation === 'Business Owner'
        ? ['Startup', 'Employment', 'Housing']
        : ['Employment', 'Housing', 'Scholarships'];

  const handleCategoryClick = (catName: string) => {
    navigate(`/search/${encodeURIComponent(catName)}`);
  };

  // Calculate Analytics Stats
  const stats = {
    savedSchemesCount: savedSchemes.length,
    applicationsCount: applications.length,
    approvedAppsCount: applications.filter(a => a.current_status === 'Approved').length,
    avgMatchScore: savedSchemes.length > 0 
      ? Math.round(savedSchemes.reduce((sum, s) => sum + s.match_score, 0) / savedSchemes.length)
      : 0,
  };

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        
        {/* Dynamic Top Greeting */}
        <div
          className="relative mb-10 overflow-hidden rounded-3xl p-8 glassmorphism neon-glow-brand flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-white/20 dark:border-white/10 shadow-lg"
          aria-label="Dashboard welcome banner"
        >
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
            >
              Hello, {userName} 👋
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans"
            >
              Welcome back. What are you looking for today?
            </motion.p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />} onClick={() => navigate('/search/Scholarships')}>
              Ask AI Advisor
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={() => navigate('/notifications')}>
                {unreadCount} New Notifications
              </Button>
            )}
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card hoverable className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.savedSchemesCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Saved Schemes</span>
          </Card>
          
          <Card hoverable className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.applicationsCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Applications</span>
          </Card>
          
          <Card hoverable className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.approvedAppsCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Approved</span>
          </Card>
          
          <Card hoverable className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.avgMatchScore}%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Match</span>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Browse Categories
            </h3>
            <span className="text-xs text-slate-400 font-sans font-semibold">Click to browse</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Browse ${cat.name} schemes`}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.name)}
                  className="cursor-pointer glassmorphism p-5 rounded-2xl border border-white/20 dark:border-white/10 hover:border-brand-500/35 hover:shadow-md flex flex-col items-start gap-4 transition-all-300"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                    {cat.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Grid Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT WIDGET COLUMN (8 of 12 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Application Progress */}
            <Card hoverable={false} animate={false}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-brand-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Application Tracking
                  </h3>
                </div>
                {applications.length > 0 && <Badge variant="success">{applications.length} Active</Badge>}
              </div>

              {appsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyState
                  title="No Applications Tracked Yet"
                  description="Begin applying to schemes to track documents, state verification, and disbursal progress."
                  actionText="Browse Schemes"
                  onAction={() => navigate('/dashboard')}
                />
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {app.scheme_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 block">
                            Current Stage: <span className="font-semibold text-brand-500">{app.current_status}</span>
                          </span>
                        </div>
                        <Badge variant={app.current_status === 'Approved' ? 'success' : 'primary'}>
                          {app.progress_percentage}%
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <ProgressBar value={app.progress_percentage} showLabel={true} color="brand" size="sm" />
                    </div>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/applications')} 
                    leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View All Applications
                  </Button>
                </div>
              )}
            </Card>

            {/* Saved Schemes Section */}
            <Card hoverable={false} animate={false}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-accent-purple" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Saved Schemes
                  </h3>
                </div>
                {savedSchemes.length > 0 && <Badge variant="purple">{savedSchemes.length} Saved</Badge>}
              </div>

              {savedLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : savedSchemes.length === 0 ? (
                <EmptyState
                  title="No Saved Schemes Yet"
                  description="Save government schemes to review requirements, download checklist resources, or apply later."
                  actionText="Browse Categories"
                  onAction={() => navigate('/dashboard')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSchemes.map((scheme) => (
                    <div 
                      key={scheme.id}
                      className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-white/20 dark:bg-slate-900/10 flex flex-col justify-between gap-4"
                    >
                      <div>
                        {scheme.provider && (
                          <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest block font-sans">
                            {scheme.provider}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                          {scheme.scheme_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-brand-500">{scheme.match_score}% Match</span>
                          {scheme.category && (
                            <Badge variant="primary" className="text-[9px]">{scheme.category}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-2 text-[10px] font-semibold text-slate-500 font-sans">
                        <span>Saved: {new Date(scheme.saved_at).toLocaleDateString('en-IN')}</span>
                        <span 
                          onClick={() => navigate('/saved-schemes')}
                          className="text-brand-500 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/saved-schemes')} 
                    leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View All Saved
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT WIDGET COLUMN (4 of 12 columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Actions Panel */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/40">
                Quick Tools
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'My Applications', desc: 'Track your progress', icon: ClipboardList, action: () => navigate('/applications') },
                  { label: 'AI Eligibility Matcher', desc: 'Check details match', icon: Sparkles, action: () => navigate('/search/Scholarships') },
                  { label: 'Saved Schemes', desc: 'View bookmarked schemes', icon: Bookmark, action: () => navigate('/saved-schemes') },
                  { label: 'Search History', desc: 'View past searches', icon: History, action: () => navigate('/search-history') },
                  { label: 'Notifications', desc: 'Stay updated', icon: FileText, action: () => navigate('/notifications') },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={act.action}
                      className="w-full text-left p-3 rounded-xl border border-slate-150 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {act.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                          {act.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Recent Notifications Preview */}
            {notifications.length > 0 && (
              <Card hoverable={false} animate={false}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/40">
                  <div className="flex items-center gap-1.8">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Recent Notifications
                    </h3>
                  </div>
                  <Badge variant={unreadCount > 0 ? 'warning' : 'neutral'}>{unreadCount} New</Badge>
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`text-xs p-2 rounded-lg border ${!notif.is_read ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-100 dark:border-brand-900/30' : 'border-slate-100 dark:border-slate-800'}`}
                    >
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{notif.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{notif.description}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => navigate('/notifications')}>
                    View All Notifications
                  </Button>
                </div>
              </Card>
            )}

            {/* Recommended Categories */}
            <Card hoverable={false} animate={false}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/40">
                <div className="flex items-center gap-1.8">
                  <Sparkles className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Recommended For You
                  </h3>
                </div>
                <Badge variant="purple">AI Powered</Badge>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mb-3">
                Based on your profile — powered by Gemini AI.
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendedCategories.map((catName) => {
                  const cat = categories.find((c) => c.name === catName);
                  if (!cat) return null;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={catName}
                      onClick={() => handleCategoryClick(catName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold font-sans border border-slate-200/60 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 hover:border-brand-500/40 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {catName}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Recent Searches */}
            <Card hoverable={false} animate={false}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/40">
                <div className="flex items-center gap-1.8">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Recent Searches
                  </h3>
                </div>
              </div>

              {searchHistoryEntries.length === 0 ? (
                <EmptyState
                  title="No Search History"
                  description="Your recent AI searches will save automatically after each category search."
                  actionText="Browse Categories"
                  onAction={() => navigate('/search/Scholarships')}
                />
              ) : (
                <div className="flex flex-wrap gap-1.5 select-none">
                  {searchHistoryEntries.slice(0, 6).map((entry) => (
                    <span
                      key={entry.id}
                      onClick={() => navigate(`/search/${encodeURIComponent(entry.category)}`)}
                      className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800 px-2.5 py-1 rounded-xl cursor-pointer transition-colors font-sans"
                    >
                      {entry.category}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Upcoming Deadlines */}
            <Card hoverable={false} animate={false}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/40">
                <div className="flex items-center gap-1.8">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Upcoming Deadlines
                  </h3>
                </div>
                <Badge variant="warning">Alerts</Badge>
              </div>
              
              <div className="space-y-3">
                {savedSchemes.slice(0, 3).map((scheme) => (
                  scheme.scheme_details?.deadline && scheme.scheme_details.deadline !== 'Unable to verify from official sources' && scheme.scheme_details.deadline !== 'Rolling' ? (
                    <div key={scheme.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {scheme.scheme_name}
                          </h4>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-sans mt-1">
                            Deadline: {scheme.scheme_details.deadline}
                          </p>
                        </div>
                        <Badge variant="warning" className="flex-shrink-0">Urgent</Badge>
                      </div>
                    </div>
                  ) : null
                ))}
                {savedSchemes.filter(s => s.scheme_details?.deadline && s.scheme_details.deadline !== 'Unable to verify from official sources' && s.scheme_details.deadline !== 'Rolling').length === 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans text-center py-4">
                    No urgent deadlines found
                  </p>
                )}
              </div>
            </Card>

          </div>

        </div>

      </div>
    </AppLayout>
  );
};
