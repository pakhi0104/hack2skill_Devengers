import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsService } from '../services';
import type { Notification } from '../types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const notifs = await notificationsService.getNotifications(user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const createNotification = useCallback(async (notif: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotif = await notificationsService.createNotification(notif);
    if (newNotif) {
      await fetchNotifications();
    }
    return newNotif;
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return false;
    const success = await notificationsService.markAsRead(id, user.id);
    if (success) {
      await fetchNotifications();
    }
    return success;
  }, [user?.id, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return false;
    const success = await notificationsService.markAllAsRead(user.id);
    if (success) {
      await fetchNotifications();
    }
    return success;
  }, [user?.id, fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!user?.id) return false;
    const success = await notificationsService.deleteNotification(id, user.id);
    if (success) {
      await fetchNotifications();
    }
    return success;
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
