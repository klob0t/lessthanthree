import { create } from 'zustand'

interface LoadingState {
   activeLoaders: Map<string, number>
   startLoading: (id: string) => void
   finishLoading: (id: string) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
   activeLoaders: new Map([['Initial Page Load', 1]]),
   isAppLoading: true,

   startLoading: (id) => {
      console.log(`%c -> startLoading called from: [${id}]`, 'color: lightblue')
      set((state) => {
         const newLoaders = new Map(state.activeLoaders)
         newLoaders.set(id, (newLoaders.get(id) || 0) + 1)
         return { activeLoaders: newLoaders, isAppLoading: true }
      })
   },

   finishLoading: (id) => {
      console.log(`%c <- finishLoading called from: [${id}]`, 'color: lightgreen')
      set((state) => {
         const newLoaders = new Map(state.activeLoaders)
         const currentCount = newLoaders.get(id)
         if (currentCount !== undefined) {
            if (currentCount > 1) {
               newLoaders.set(id, currentCount - 1)
            } else {
               newLoaders.delete(id)
            }
         }
         return {
            activeLoaders: newLoaders,
            isAppLoading: newLoaders.size > 0
         }
      })
   }
}))

useLoadingStore.subscribe((state) => {
   console.log('%c Loader count:', 'color: yellow', state.activeLoaders)
})
