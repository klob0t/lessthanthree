// src/app/lib/utils/PinSequence.tsx
'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import { useLoadingStore } from '@/app/lib/store/loadingStore'

gsap.registerPlugin(ScrollTrigger)

export default function PinSequence({ skipFirst = 0, markers = false }: { skipFirst?: number, markers?: boolean }) {
  const triggerEl = useTriggerStore((s) => s.triggerEl)
  const isLoaded = useLoadingStore((s) => s.activeLoaders.size === 0)

  useEffect(() => {
    if (!triggerEl) return
    const children = Array.from(triggerEl.children) as HTMLElement[]
    if (children.length === 0) return

    // we'll fill this array inside the context callback and attach it to ctx AFTER ctx is created
    const created: ScrollTrigger[] = []

    // create the gsap context and create triggers inside it (do NOT reference `ctx` inside)
    const ctx = gsap.context(() => {
      for (let i = skipFirst; i < children.length; i++) {
        const el = children[i]
        if (!el) continue

        const endFn = () => `+=${el.offsetHeight}`

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: endFn,
          pin: el,
          pinSpacing: true,
          invalidateOnRefresh: true,
          markers,
        })

        created.push(st)
      }
    }, triggerEl) // scope to triggerEl

    // attach created triggers to ctx AFTER ctx is initialized (avoids TDZ)
    ;(ctx as any)._created = created

    return () => {
      try {
        const createdTriggers: ScrollTrigger[] = (ctx as any)._created || []
        createdTriggers.forEach(t => t.kill())
        delete (ctx as any)._created
      } catch (e) { /* ignore */ }
      ctx.revert()
    }
  }, [triggerEl, isLoaded, skipFirst, markers])

  return null
}
