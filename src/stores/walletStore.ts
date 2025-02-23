import { create } from 'zustand'

interface WalletState {
  balance: number
  setBalance: (balance: number) => void
  updateBalance: (newBalance: number) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  setBalance: (balance: number) => set({ balance }),
  updateBalance: (newBalance: number) => set({ balance: newBalance })
}))