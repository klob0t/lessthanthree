// src/app/components/Letter.tsx
'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import Markdown from 'markdown-to-jsx'
import styles from './letter.module.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import { calculateDays } from '@/app/components/Counter'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Letter() {
  const [rawMd, setRawMd] = useState<string>('')
  // compute once on mount
  const date = useMemo(() => calculateDays(), [])
  const triggerEl = useTriggerStore((s) => s.triggerEl)
  const letterPageRef = useRef<HTMLDivElement | null>(null)

  // fetch markdown (raw)
  useEffect(() => {
    let mounted = true
    fetch('/letter/letter.md')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.text()
      })
      .then((text) => mounted && setRawMd(text))
      .catch(() => mounted && setRawMd('Failed to load letter.'))
    return () => { mounted = false }
  }, [])

  // Replace token with date whenever rawMd or date changes
  const md = useMemo(() => {
    if (!rawMd) return ''
    return rawMd.replace(/\{\{DAYS\}\}/g, String(date))
  }, [rawMd, date])

  // GSAP split/scroll animation (unchanged except dependency on md)
  useGSAP(
    () => {
      if (!triggerEl || !letterPageRef.current || !md) return

      const children = Array.from(triggerEl.children) as HTMLElement[]
      const letterTrig = children[3] ?? null
      if (!letterTrig) return

      const el = letterPageRef.current

      // Split text nodes inside paragraphs/headings
      const blocks = el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote')

      // use precise instance type to avoid `any`
      const splits: Array<InstanceType<typeof SplitText>> = []
      blocks.forEach((node) => {
        const inst = new SplitText(node as HTMLElement, { type: 'words,chars' }) as InstanceType<typeof SplitText>
        splits.push(inst)
      })

      // collect words (or .chars if you prefer)
      const allChars = splits.flatMap(s => (s.words ?? []))

      const tween = gsap.from(allChars, {
        autoAlpha: 0,
        y: 0,
        stagger: { each: 0.005, from: 'start' },
        duration: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: letterTrig,
          start: 'top center',
          end: 'bottom top',
          markers: false,
          scrub: true
        }
      })

      // cleanup when unmounting
      return () => {
        // kill ScrollTrigger if present (safe unknown cast to avoid `any`)
        const maybeSt = (tween as unknown as { scrollTrigger?: { kill?: () => void } }).scrollTrigger
        if (maybeSt && typeof maybeSt.kill === 'function') {
          try { maybeSt.kill() } catch { /* ignore */ }
        }

        // kill tween
        try { if (typeof (tween as unknown as { kill?: () => void }).kill === 'function') (tween as unknown as { kill?: () => void }).kill!() } catch { /* ignore */ }

        // revert SplitText instances
        splits.forEach(s => {
          try { s.revert() } catch { /* ignore */ }
        })
      }
    },
    { dependencies: [triggerEl, md], scope: letterPageRef } // scope animations to letterPageRef
  )


  return (
    <div className={styles.letterPage} ref={letterPageRef}>
      <div className={styles.letterWrapper}>
        <Markdown>{md}</Markdown>
      </div>
    </div>
  )
}
