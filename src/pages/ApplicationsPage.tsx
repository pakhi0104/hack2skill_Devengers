import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Timeline } from '../components/ui/Timeline';
import type { TimelineStep } from '../components/ui/Timeline';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { MatchScoreRing } from '../components/recommendations/MatchScoreRing';
import { DocumentChecklist } from '../components/recommendations/DocumentChecklist';
import {
  ClipboardList,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useApplications, useApplicationDocuments } from '../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ApplicationStatus } from '../types';

const STATUS_ORDER: ApplicationStatus[] = [
  'Not Started',
  'Preparing Documents',
  'Applied',
  'Under Review',
  'Approved',
  'Rejected',
  'Closed',
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Not Started': 'neutral',
  'Preparing Documents': 'warning',
  'Applied': 'primary',
  'Under Review': 'info',
  'Approved': 'success',
  'Rejected': 'error',
  'Closed': 'neutral',
};

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();
  const { applications, loading, updateApplicationStatus } = useApplications();
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const stats = {
    total: applications.length,
    inProgress: applications.filter(a => 
      ['Preparing Documents', 'Applied', 'Under Review'].includes(a.current_status)).length,
    approved: applications.filter(a => a.current_status === 'Approved').length,
  };

  const toggleExpand = (id: string) => {
    setExpandedAppId(expandedAppId === id ? null : id);
  };

  const handleBackToSuggestion = () => {
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              My Applications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Track every scheme application from submission to disbursal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToSuggestion}
              aria-label="Go back to the suggestion"
            >
              Back to Suggestion
            </Button>
            <Button
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
              aria-label="Track a new application"
            >
              Find Schemes
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Submitted', value: stats.total, icon: FileText, color: 'text-brand-500 bg-brand-500/10' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-accent-emerald bg-emerald-500/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} hoverable={false} animate={false} className="flex flex-col items-center gap-2 py-4 text-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`} aria-hidden="true">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">{stat.label}</span>
              </Card>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <Card key={i} hoverable={false} animate={false} className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-full" />
              </Card>
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-5">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hoverable className="space-y-5">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <MatchScoreRing score={app.match_score} matchLevel={getMatchLevel(app.match_score)} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {app.scheme_name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {app.category && <Badge variant="primary">{app.category}</Badge>}
                        <Badge variant={STATUS_COLORS[app.current_status] as any}>{app.current_status}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Provider + dates
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    Started: {new Date(app.started_at).toLocaleDateString('en-IN')} • Last Updated: {new Date(app.updated_at).toLocaleDateString('en-IN')}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 font-sans mb-1.5">
                      <span>Overall Progress</span>
                      <span>{app.progress_percentage}%</span>
                    </div>
                    <ProgressBar value={app.progress_percentage} color="brand" size="sm" />
                  </div>

                  {/* Action Buttons
                  <div className="flex flex-wrap gap-2">
                    {app.official_url && (
                      <a href={app.official_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Official Site
                        </Button>
                      </a>
                    )}
                    {app.scheme_details && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/schemes/${app.id}`, { state: { scheme: app.scheme_details } })}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View Scheme
                      </Button>
                    )}
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      Update Status:
                    </div>
                    {STATUS_ORDER.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={app.current_status === status ? "primary" : "outline"}
                        onClick={async () => {
                          const progress = Math.round((STATUS_ORDER.indexOf(status) / (STATUS_ORDER.length - 1)) * 100);
                          await updateApplicationStatus(app.id, status, progress);
                          success('Updated', `Application status updated to ${status}`);
                        }}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>

                  {/* Toggle expand button */}
                  <div className="border-t border-slate-100 dark:border-slate-800/30 pt-4">
                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="text-[11px] font-bold text-brand-500 flex items-center gap-1 hover:text-brand-600"
                    >
                      {expandedAppId === app.id ? 'Hide Details' : 'View Details'}
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedAppId === app.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {expandedAppId === app.id && (
                    <ApplicationDetails app={app} />
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <Card hoverable={false} animate={false}>
              <EmptyState
                icon={<ClipboardList className="w-8 h-8 text-emerald-400" />}
                title="No Tracked Applications"
                description="Start applying to schemes from the Dashboard. Your application journey — from submission to disbursal — will appear here."
                actionText="Go to Dashboard"
                onAction={() => window.location.href = '/dashboard'}
              />
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const ApplicationDetails = ({ app }: { app: any }) => {
  const { documents, loading, toggleDocument, readiness } = useApplicationDocuments(app.id);

  const checklist = documents.map(doc => ({ name: doc.document_name, id: doc.id, completed: doc.completed }));
  const missing = documents.filter(doc => !doc.completed).map(doc => doc.document_name);

  const getTimelineStepsLocal = (app: any): TimelineStep[] => {
    return STATUS_ORDER.map((status, index) => {
      const currentIndex = STATUS_ORDER.indexOf(app.current_status);
      const statusIndex = index;
      let stepStatus: 'done' | 'active' | 'pending' = 'pending';
      if (statusIndex < currentIndex) stepStatus = 'done';
      if (statusIndex === currentIndex) stepStatus = 'active';
      
      return {
        label: status,
        status: stepStatus,
      };
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <Card hoverable={false} animate={false} className="p-4">
        <h5 className="text-sm font-bold mb-4">Timeline</h5>
        <Timeline steps={getTimelineStepsLocal(app)} />
      </Card>

      <Card hoverable={false} animate={false} className="p-4">
        <h5 className="text-sm font-bold mb-4">Documents Checklist</h5>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <DocumentChecklist
            documents={checklist}
            readiness={readiness}
            missingDocuments={missing}
            onToggle={async (id, completed) => {
              await toggleDocument(id, completed);
            }}
          />
        )}
      </Card>

      <Card hoverable={false} animate={false} className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h5 className="text-sm font-bold">AI Next Step</h5>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
          Based on your current status: <strong>{app.current_status}</strong>. Next, 
          {app.current_status === 'Not Started' && ' collect all required documents first.'}
          {app.current_status === 'Preparing Documents' && ' complete all documents then submit the application.'}
          {app.current_status === 'Applied' && ' wait for verification and review.'}
          {app.current_status === 'Under Review' && ' be patient, your application is being processed.'}
          {app.current_status === 'Approved' && ' congratulations! Check your bank for disbursement.'}
        </p>
      </Card>
    </div>
  );
};
