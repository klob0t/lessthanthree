// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import Hero from '@/app/components/Hero'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect, useRef } from 'react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {
  const { finishLoading } = useLoadingStore()
  const gridRef = useRef<HTMLDivElement>(null)
  const setTrigger = useTriggerStore((s) => s.setTrigger)

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
        <Scene/>
      </div>
      <div className={styles.grid} ref={gridRef}>
        <div className={styles.hero}>
          <Hero />
        </div>
        <div className={styles.photo}>
          <Photos />
        </div>
        <div className={styles.letter}>
        </div>
        <div className={styles.ending}>
        </div>
      </div>

    </main >
  )
}
