import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { SchemeRecommendation } from '../../types/schemes';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MatchScoreRing } from './MatchScoreRing';
import {
  ExternalLink,
  Eye,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { useRecommendationContext } from '../../contexts/RecommendationContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedSchemes } from '../../hooks';

interface RecommendationCardProps {
  scheme: SchemeRecommendation;
  index?: number;
  onViewDetails?: (scheme: SchemeRecommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  scheme,
  index = 0,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCompare, isInCompare } = useRecommendationContext();
  const { success } = useToast();
  const { savedSchemes, saveScheme, removeScheme } = useSavedSchemes();
  const inCompare = isInCompare(scheme.id);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = savedSchemes.some(s => s.scheme_name === scheme.name);
    setIsSaved(saved);
  }, [savedSchemes, scheme.name]);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(scheme);
    } else {
      navigate(`/schemes/${scheme.id}`, { state: { scheme } });
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card
        hoverable
        animate={false}
        className="relative overflow-hidden group"
      >
        {!scheme.verified && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="warning">
              <AlertCircle className="w-3 h-3 mr-0.5 inline" />
              Unverified
            </Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-5">
          <MatchScoreRing score={scheme.matchScore} matchLevel={scheme.matchLevel} size="md" />

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <Badge variant="primary" className="mb-2">{scheme.category}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {scheme.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{scheme.provider}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              {scheme.shortDescription}
            </p>

            {/* Why recommended */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                Why AI Recommended This
              </span>
              <ul className="space-y-0.5">
                {scheme.whyRecommended.slice(0, 4).map((reason, i) => (
                  <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 font-sans flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {reason.replace(/^✔\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {scheme.applyLink && (
                <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Apply
                  </Button>
                </a>
              )}
              {scheme.officialWebsite && (
                <a href={scheme.officialWebsite} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Official Site
                  </Button>
                </a>
              )}
              <Button size="sm" variant="secondary" onClick={handleViewDetails} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (inCompare) return;
                  addToCompare(scheme);
                  success('Added to Compare', `${scheme.name} added to comparison.`);
                }}
                disabled={inCompare}
                leftIcon={<GitCompare className="w-3.5 h-3.5" />}
              >
                {inCompare ? 'In Compare' : 'Compare'}
              </Button>
              <Button
                size="sm"
                variant={isSaved ? "primary" : "outline"}
                onClick={handleSaveScheme}
                leftIcon={<Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
