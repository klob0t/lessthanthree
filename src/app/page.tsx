// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect, useRef } from 'react'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {

  const { startLoading, finishLoading } = useLoadingStore()
  const sceneRef = useRef(null)

  useEffect(() => {
    finishLoading('Initial Load')
  }, [])


  return (
    <main className={styles.main}>
      <Scene trigger={sceneRef} />
      <div className={styles.grid} ref={sceneRef}>
        <section>
        </section>
        <section>
        </section>
        <section>
        </section>
      </div>
    </main>
  )
}
