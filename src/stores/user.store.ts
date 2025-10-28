import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logout } from '@/processes/auth'

export interface UserInfo {
  id: string
  email: string
  name: string

}

interface UserState {
  userInfo: UserInfo | null
  setUserInfo: (userInfo: UserInfo) => void
  clearUserInfo: () => void
  logout: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (userInfo) => 
        set({ 
          userInfo, 
        }),
      clearUserInfo: () =>
        set({ 
          userInfo: null, 
        }),
      logout: async () => {
        try {
          await logout();
          set({ userInfo: null });
        } catch (error) {
          console.error('Logout error:', error);
          // Mesmo com erro, limpar o estado local
          set({ userInfo: null });
        }
      },
    }),
    {
      name: 'user-storage'
    }
  )
)
