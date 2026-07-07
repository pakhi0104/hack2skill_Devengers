import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Notification } from '../types';

// Local storage keys for mock mode
const MOCK_NOTIFICATIONS_KEY = 'schemematch_mock_notifications';

export const notificationsService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      if (mockData) {
        const allNotifs: Notification[] = JSON.parse(mockData);
        return allNotifs.filter(n => n.user_id === userId)
                       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      return [];
    }
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotifications(userId);
    return notifications.filter(n => !n.is_read).length;
  },

  /**
   * Create a new notification
   */
  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification | null> {
    const newNotif: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotif])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      const allNotifs: Notification[] = mockData ? JSON.parse(mockData) : [];
      allNotifs.push(newNotif);
      localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
      return newNotif;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      if (mockData) {
        const allNotifs: Notification[] = JSON.parse(mockData);
        const index = allNotifs.findIndex(n => n.id === id && n.user_id === userId);
        if (index !== -1) {
          allNotifs[index].is_read = true;
          localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
        }
      }
      return true;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      if (mockData) {
        const allNotifs: Notification[] = JSON.parse(mockData);
        const updatedNotifs = allNotifs.map(n => 
          n.user_id === userId ? { ...n, is_read: true } : n
        );
        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifs));
      }
      return true;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      if (mockData) {
        const allNotifs: Notification[] = JSON.parse(mockData);
        const filteredNotifs = allNotifs.filter(n => n.id !== id);
        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(filteredNotifs));
      }
      return true;
    }
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting all notifications:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
      if (mockData) {
        const allNotifs: Notification[] = JSON.parse(mockData);
        const filteredNotifs = allNotifs.filter(n => n.user_id !== userId);
        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(filteredNotifs));
      }
      return true;
    }
  }
};
