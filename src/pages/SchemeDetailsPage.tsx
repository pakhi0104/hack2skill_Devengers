import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRecommendationContext } from '../contexts/RecommendationContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MatchScoreRing } from '../components/recommendations/MatchScoreRing';
import { DocumentChecklist } from '../components/recommendations/DocumentChecklist';
import { RoadmapTimeline } from '../components/recommendations/RoadmapTimeline';
import { generateRoadmap, generateDocumentChecklist } from '../services/ai/roadmapGenerator';
import type { SchemeRecommendation, RoadmapStep } from '../types/schemes';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PlayCircle,
  Download,
  Share2,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSavedSchemes, useApplications } from '../hooks';
import { applicationsService } from '../services';

export const SchemeDetailsPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { lastResult, addToCompare, isInCompare } = useRecommendationContext();
  const { success, error } = useToast();
  const { user } = useAuth();
  const { savedSchemes, saveScheme, removeScheme } = useSavedSchemes();
  const { applications, startApplication } = useApplications();

  const [scheme, setScheme] = useState<SchemeRecommendation | null>(
    (location.state as { scheme?: SchemeRecommendation })?.scheme || null
  );
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    if (!scheme && lastResult) {
      const found = lastResult.recommendations.find((s) => s.id === schemeId);
      if (found) setScheme(found);
    }
  }, [scheme, schemeId, lastResult]);

  useEffect(() => {
    if (scheme) {
      generateRoadmap(scheme).then(setRoadmap);
      setIsSaved(savedSchemes.some(s => s.scheme_name === scheme.name));
      setIsTracked(applications.some(a => a.scheme_name === scheme.name));
    }
  }, [scheme, savedSchemes, applications]);

  if (!scheme) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto py-20 text-center px-6">
          <h2 className="text-lg font-bold">Scheme not found</h2>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const { checklist, readiness, missing } = generateDocumentChecklist(scheme);
  const inCompare = isInCompare(scheme.id);

  const handleSaveScheme = async () => {
    if (!user?.id) return;
    if (isSaved) {
      const saved = savedSchemes.find(s => s.scheme_name === scheme.name);
      if (saved) {
        await removeScheme(saved.id);
        success('Removed', `${scheme.name} removed from saved schemes.`);
      }
    } else {
      await saveScheme({
        user_id: user.id,
        scheme_name: scheme.name,
        provider: scheme.provider,
        category: scheme.category,
        official_url: scheme.officialWebsite,
        match_score: scheme.matchScore,
        summary: scheme.shortDescription,
        scheme_details: scheme,
      });
      success('Saved!', `${scheme.name} added to saved schemes.`);
    }
  };

  const handleStartApplication = async () => {
    if (!user?.id) return;
    const newApp = await startApplication({
      user_id: user.id,
      scheme_name: scheme.name,
      provider: scheme.provider,
      category: scheme.category,
      official_url: scheme.officialWebsite,
      current_status: 'Not Started',
      progress_percentage: 0,
      match_score: scheme.matchScore,
      scheme_details: scheme,
    });
    if (newApp) {
      // Add default documents
      const documentItems = checklist.map((doc: any) => ({
        application_id: newApp.id,
        document_name: typeof doc === 'string' ? doc : doc.name,
        completed: false,
      }));
      await applicationsService.addApplicationDocuments(newApp.id, documentItems);
      success('Started!', `Now tracking your application for ${scheme.name}.`);
      navigate('/applications', { state: { returnTo: `/schemes/${scheme.id}` } });
    }
  };

  const handleExportPDF = () => {
    // Create a simple text-based export as PDF library is not installed
    const content = `
SchemeMatch - Scheme Details
============================
Scheme Name: ${scheme.name}
Provider: ${scheme.provider}
Category: ${scheme.category}
Match Score: ${scheme.matchScore}%

Description:
${scheme.shortDescription}

Benefits:
${scheme.benefits.join('\n')}

Eligibility:
${scheme.eligibility.join('\n')}

Documents Required:
${scheme.documents.join('\n')}

Interest Rate: ${scheme.interestRate || 'N/A'}
Processing Time: ${scheme.processingTime || 'N/A'}
Deadline: ${scheme.deadline || 'N/A'}

Official Website: ${scheme.officialWebsite}
Apply Link: ${scheme.applyLink || 'N/A'}

Generated by SchemeMatch AI
    `.trim();

    // Create a blob and download as text file (PDF would require jsPDF library)
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheme.name.replace(/[^a-z0-9]/gi, '_')}_details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Exported', 'Scheme details exported successfully.');
  };

  const handleShare = async () => {
    const shareData = {
      title: scheme.name,
      text: `Check out this government scheme: ${scheme.name}. Match Score: ${scheme.matchScore}%`,
      url: scheme.officialWebsite || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        success('Shared', 'Scheme shared successfully.');
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          error('Share Failed', 'Unable to share the scheme.');
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      success('Copied', 'Scheme link copied to clipboard.');
    }
  };

  return (
    <AppLayout showFooter>
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 mb-6 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <Card hoverable={false} animate={false} className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <MatchScoreRing score={scheme.matchScore} matchLevel={scheme.matchLevel} size="lg" />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="primary">{scheme.category}</Badge>
                  {!scheme.verified && (
                    <Badge variant="warning">
                      <AlertCircle className="w-3 h-3 mr-0.5 inline" />
                      Unable to verify from official sources
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {scheme.name}
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">{scheme.provider}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-sans leading-relaxed">
                  {scheme.shortDescription}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {scheme.applyLink && (
                    <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>Apply Now</Button>
                    </a>
                  )}
                  {!isTracked && (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={handleStartApplication}
                      leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                    >
                      Track Application
                    </Button>
                  )}
                  {scheme.officialWebsite && (
                    <a href={scheme.officialWebsite} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Official Website
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={inCompare}
                    onClick={() => { addToCompare(scheme); success('Added', 'Added to compare list.'); }}
                    leftIcon={<GitCompare className="w-3.5 h-3.5" />}
                  >
                    Compare
                  </Button>
                  <Button
                    size="sm"
                    variant={isSaved ? "primary" : "outline"}
                    onClick={handleSaveScheme}
                    leftIcon={<Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportPDF}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Summary */}
          {scheme.aiSummary && (
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand-500" />
                AI Summary
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                {scheme.aiSummary}
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefits */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Benefits</h3>
              <ul className="space-y-1.5">
                {scheme.benefits.map((b, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-sans flex gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Eligibility */}
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Eligibility</h3>
              <ul className="space-y-1.5">
                {scheme.eligibility.map((e, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-sans flex gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                    {e}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Why recommended */}
          <Card hoverable={false} animate={false}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">AI Recommendation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3">{scheme.aiRecommendation}</p>
            {scheme.whyBetter && (
              <p className="text-xs text-slate-500 font-sans italic border-t border-slate-100 dark:border-slate-800/40 pt-3">
                {scheme.whyBetter}
              </p>
            )}
            <ul className="mt-3 space-y-1">
              {scheme.whyRecommended.map((r, i) => (
                <li key={i} className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">{r}</li>
              ))}
            </ul>
          </Card>

          {/* Important info + meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Interest Rate', value: scheme.interestRate },
              { label: 'Processing Time', value: scheme.processingTime },
              { label: 'Deadline', value: scheme.deadline },
            ].map((item) => (
              <Card key={item.label} hoverable={false} animate={false} className="p-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {item.value || 'Unable to verify from official sources'}
                </span>
              </Card>
            ))}
          </div>

          {/* Roadmap & Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold mb-4">Application Roadmap</h3>
              <RoadmapTimeline steps={roadmap.length > 0 ? roadmap : []} />
            </Card>
            <Card hoverable={false} animate={false}>
              <DocumentChecklist documents={checklist} readiness={readiness} missingDocuments={missing} />
            </Card>
          </div>

          {/* FAQs */}
          {scheme.faqs && scheme.faqs.length > 0 && (
            <Card hoverable={false} animate={false}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {scheme.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{faq.question}</h4>
                    <p className="text-[11px] text-slate-500 font-sans mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};
