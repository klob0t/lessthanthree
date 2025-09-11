// src/app/stores/triggerStore.ts
import { create } from 'zustand'

type TriggerState = {
   triggerEl: HTMLElement | null
   setTrigger: (el: HTMLElement | null) => void
}

export const useTriggerStore = create<TriggerState>((set) => ({
   triggerEl: null,
   setTrigger: (el: HTMLElement | null) => set({ triggerEl: el })
}))
