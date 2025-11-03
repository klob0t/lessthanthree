// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import Hero from '@/app/components/Hero'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import Letter from '@/app/components/Letter'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Ending from '@/app/components/Ending'
import { useStartFlowStore } from '@/app/lib/store/buttonStore'

gsap.registerPlugin(ScrollTrigger)

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {
  const { finishLoading } = useLoadingStore()
  const gridRef = useRef<HTMLDivElement>(null)
  const setTrigger = useTriggerStore((s) => s.setTrigger)

  const letterRef = useRef<HTMLDivElement>(null)

  console.log(letterRef.current?.offsetHeight)

  const [letterHeight, setLetterHeight] = useState<number | null>(null)

  const enterSignal = useStartFlowStore(s => s.enterSignal)

  const triggerEl = useTriggerStore((s) => s.triggerEl)

  useEffect(() => {
    finishLoading('Initial Page Load')
  }, [finishLoading])

  useEffect(() => {
    if (!gridRef.current) return

    const raf = requestAnimationFrame(() => {
      setTrigger(gridRef.current)
    })

    return () => {
      cancelAnimationFrame(raf)
      setTrigger(null)
    }
  }, [setTrigger])

  useGSAP(() => {

    if (!triggerEl || enterSignal === 0) return

    const children = Array.from(triggerEl?.children)

    ScrollTrigger.create({
      // markers: true,
      trigger: children[1],
      start: 'top top',
      endTrigger: children[1],
      end: 'bottom top',

      pinType: 'fixed',
      pin: children[1],
      pinSpacing: false
    })

    ScrollTrigger.create({
      // markers: true,
      trigger: children[3],
      start: 'top top',
      endTrigger: children[3],
      end: 'bottom top',
      pin: children[3],
      pinType: 'fixed',
      pinSpacing: false
    })
  }, { dependencies: [triggerEl, enterSignal] })

  useLayoutEffect(() => {
    if (!letterRef.current) return
    const update = () => setLetterHeight(letterRef.current!.offsetHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(letterRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <main className={styles.main}>
      <div
        style={{
          position: 'fixed',
          width: '100dvw',
          height: '100dvh',
          zIndex: 2
        }}
      >
        <Scene />
      </div>
      <div className={styles.grid} ref={gridRef}>
        <div className={styles.hero}>
          <Hero />
        </div>
        <div className={styles.photo}>
          <Photos />
        </div>
        <div className={styles.spacer}
          style={{ height: '100lvh' }}
        />
        <div className={styles.letter} ref={letterRef}>
          <Letter />
        </div>
        <div
          className={styles.spacer}
          style={letterHeight ? { height: `${letterHeight}px` } : { height: '100lvh' }}
        />
        <div className={styles.ending}>
          <Ending />
        </div>

      </div>

    </main >
  )
}


