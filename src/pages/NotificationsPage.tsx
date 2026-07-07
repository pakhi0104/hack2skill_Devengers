import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../hooks';
import type { NotificationType } from '../types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<any>> = {
  'Application Reminder': AlertCircle,
  'Deadline Reminder': Calendar,
  'Missing Documents': FileText,
  'Saved Scheme Updates': Sparkles,
  'New Matching Scheme': Bell,
  'General Updates': Bell,
};

export const NotificationsPage: React.FC = () => {
  const { success } = useToast();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Stay updated with your scheme applications and recommendations.
            </p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await markAllAsRead();
                success('Marked All', 'All notifications marked as read');
              }}
            >
              Mark All Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} hoverable={false} animate={false} className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card hoverable className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${notification.is_read 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                        : 'bg-brand-500/10 text-brand-500'}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold leading-snug
                          ${notification.is_read 
                            ? 'text-slate-600 dark:text-slate-400' 
                            : 'text-slate-900 dark:text-white'}`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                          )}
                        </div>
                      </div>

                      {notification.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-2">
                          {notification.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral">{notification.type}</Badge>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {new Date(notification.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await markAsRead(notification.id);
                              }}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await deleteNotification(notification.id);
                              success('Deleted', 'Notification deleted');
                            }}
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card hoverable={false} animate={false}>
            <EmptyState
              icon={<Bell className="w-8 h-8 text-brand-400" />}
              title="No Notifications"
              description="You're all caught up! We'll notify you about any important updates regarding your schemes and applications."
            />
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
