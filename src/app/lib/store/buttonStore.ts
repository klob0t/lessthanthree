// app/lib/store/buttonStore.ts
'use client'
import { create } from 'zustand'

// Use counters so every emit produces a new value (booleans are easy to "miss")
interface StartFlowStore {
  exitSignal: number
  enterSignal: number
  isSequencing: boolean
  triggerExit: () => void
  triggerEnter: () => void
  startSequence: (opts?: { exitDelay?: number; enterDelay?: number }) => void
  cancelSequence: () => void
}

let exitTO: number | null = null
let enterTO: number | null = null

export const useStartFlowStore = create<StartFlowStore>((set) => ({
  exitSignal: 0,
  enterSignal: 0,
  isSequencing: false,

  triggerExit: () => set((s) => ({ exitSignal: s.exitSignal + 1 })),
  triggerEnter: () => set((s) => ({ enterSignal: s.enterSignal + 1 })),

  startSequence: (opts) => {
    const exitDelay = opts?.exitDelay ?? 0       // when to send exit
    const enterDelay = opts?.enterDelay ?? 1000   // gap after exit before enter

    // clear any previous sequence
    if (exitTO) window.clearTimeout(exitTO)
    if (enterTO) window.clearTimeout(enterTO)

    set({ isSequencing: true })

    // 1) broadcast EXIT
    if (exitDelay === 0) {
      set((s) => ({ exitSignal: s.exitSignal + 1 }))
    } else {
      exitTO = window.setTimeout(() => {
        set((s) => ({ exitSignal: s.exitSignal + 1 }))
      }, exitDelay)
    }

    // 2) broadcast ENTER after exit + gap
    enterTO = window.setTimeout(() => {
      set((s) => ({ enterSignal: s.enterSignal + 1, isSequencing: false }))
    }, exitDelay + enterDelay)
  },

  cancelSequence: () => {
    if (exitTO) window.clearTimeout(exitTO)
    if (enterTO) window.clearTimeout(enterTO)
    exitTO = enterTO = null
    set({ isSequencing: false })
  },
}))
