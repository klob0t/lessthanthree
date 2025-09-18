// src/app/components/Letter.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react'
import Markdown from 'markdown-to-jsx'
import styles from './letter.module.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Letter() {
  const [md, setMd] = useState<string>('')
  const triggerEl = useTriggerStore((s) => s.triggerEl)
  const letterPageRef = useRef<HTMLDivElement | null>(null)

  // fetch markdown
  useEffect(() => {
    let mounted = true
    fetch('/letter/letter.md')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.text()
      })
      .then((text) => mounted && setMd(text))
      .catch(() => mounted && setMd('Failed to load letter.'))
    return () => { mounted = false }
  }, [])

  // useGSAP handles SplitText + animation
  useGSAP(
    () => {
      if (!triggerEl || !letterPageRef.current || !md) return

      const children = Array.from(triggerEl.children) as HTMLElement[]
      const letterTrig = children[3] ?? null
      if (!letterTrig) return

      const el = letterPageRef.current

      // Split text nodes inside paragraphs/headings
      const blocks = el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote')
      const splits: SplitText[] = []
      blocks.forEach((node) => {
        splits.push(new SplitText(node as HTMLElement, { type: 'words,chars' }))
      })

      const allChars = splits.flatMap(s => s.words)

      gsap.from(allChars, {
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
        splits.forEach(s => s.revert())
      }
    },
    { dependencies: [triggerEl, md], scope: letterPageRef } // scope animations to letterPageRef
  )

  return (
    <div className={styles.letterPage} ref={letterPageRef}>
      <Markdown>{md}</Markdown>
    </div>
  )
}
