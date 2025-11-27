import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      products: [],
      services: [],
      loading: false,

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const { data } = await api.get('/wishlist');
          set({ products: data.products, services: data.services });
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      addProduct: async (productId) => {
        try {
          await api.post(`/wishlist/product/${productId}`);
          get().fetchWishlist();
          return true;
        } catch (error) {
          return false;
        }
      },

      removeProduct: async (productId) => {
        try {
          await api.delete(`/wishlist/product/${productId}`);
          set({ products: get().products.filter(p => p._id !== productId) });
          return true;
        } catch (error) {
          return false;
        }
      },

      addService: async (serviceId) => {
        try {
          await api.post(`/wishlist/service/${serviceId}`);
          get().fetchWishlist();
          return true;
        } catch (error) {
          return false;
        }
      },

      removeService: async (serviceId) => {
        try {
          await api.delete(`/wishlist/service/${serviceId}`);
          set({ services: get().services.filter(s => s._id !== serviceId) });
          return true;
        } catch (error) {
          return false;
        }
      },

      isInWishlist: (type, itemId) => {
        if (type === 'product') {
          return get().products.some(p => p._id === itemId);
        }
        return get().services.some(s => s._id === itemId);
      },

      clear: () => set({ products: [], services: [] })
    }),
    { name: 'wishlist-storage' }
  )
);
