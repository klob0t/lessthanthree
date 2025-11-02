// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import Hero from '@/app/components/Hero'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect, useRef } from 'react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import Letter from '@/app/components/Letter'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Ending from '@/app/components/Ending'
import Loading from '@/app/components/Loading'

gsap.registerPlugin(ScrollTrigger)

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {
  const { finishLoading } = useLoadingStore()
  const gridRef = useRef<HTMLDivElement>(null)
  const setTrigger = useTriggerStore((s) => s.setTrigger)

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

    if (!triggerEl) return

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
  }, { dependencies: [triggerEl] })

  return (
    <main className={styles.main}>
      {/* <Loading /> */}
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
        <div className={styles.spacer}>
        </div>
        <div className={styles.letter}>
          <Letter />
        </div>
        <div className={styles.spacer}>
        </div>
        <div className={styles.ending}>
        <Ending />
        </div>

      </div>

    </main >
  )
}


