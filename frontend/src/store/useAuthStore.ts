import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  phone: string;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  loginPromptReason: string | null;

  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  setAuth: (token: string, user: AuthUser, phone: string) => void;
  logout: () => void;
  hydrateAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  phone: '',
  isAuthenticated: false,
  isLoginModalOpen: false,
  loginPromptReason: null,

  openLoginModal: (reason?: string) => {
    set({
      isLoginModalOpen: true,
      loginPromptReason: reason || null,
    });
  },

  closeLoginModal: () => {
    set({
      isLoginModalOpen: false,
      loginPromptReason: null,
    });
  },

  setAuth: (token: string, user: AuthUser, phone: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('martverse_token', token);
      localStorage.setItem('martverse_user', JSON.stringify(user));
      localStorage.setItem('martverse_phone', phone);
    }
    set({
      token,
      user,
      phone,
      isAuthenticated: true,
      isLoginModalOpen: false,
      loginPromptReason: null,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('martverse_token');
      localStorage.removeItem('martverse_user');
      localStorage.removeItem('martverse_phone');
    }
    set({
      token: null,
      user: null,
      phone: '',
      isAuthenticated: false,
    });
  },

  hydrateAuth: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('martverse_token');
    const storedUser = localStorage.getItem('martverse_user');
    const phone = localStorage.getItem('martverse_phone') || '';
    if (token) {
      let parsedUser: AuthUser | null = null;
      try {
        if (storedUser) parsedUser = JSON.parse(storedUser);
      } catch {}
      set({
        token,
        user: parsedUser || { id: 'user-default', email: 'user@martverse.com', phone },
        phone: phone || (parsedUser?.phone || ''),
        isAuthenticated: true,
      });
    }
  },
}));
