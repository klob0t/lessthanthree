// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import Hero from '@/app/components/Hero'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect, useRef } from 'react'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {
  const { startLoading, finishLoading } = useLoadingStore()
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finishLoading('Initial Load')
  }, [])


  return (
    <main className={styles.main}>
      <div className={styles.grid} ref={sceneRef}>
        <div className={styles.hero}>
        <Hero />
        </div>
        <div className={styles.photo}>
        <Photos trigger={sceneRef}/>
        </div>
        <div className={styles.letter}>
        heyy
        </div>
        <div className={styles.ending}>
        heyy
        </div>
      <Scene trigger={sceneRef} />
      </div>
    </main>
  )
}
