import { create } from 'zustand';
import api from '../api/axios';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      set({
        notifications: get().notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set({
        notifications: get().notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const notification = get().notifications.find(n => n._id === notificationId);
      set({
        notifications: get().notifications.filter(n => n._id !== notificationId),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, get().unreadCount - 1) 
          : get().unreadCount
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  clear: () => set({ notifications: [], unreadCount: 0 })
}));
