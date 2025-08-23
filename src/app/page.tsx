// src/app/page.tsx

'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import Photos from '@/app/components/Photos'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useEffect } from 'react'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {

  const { startLoading, finishLoading } = useLoadingStore()

  useEffect(() => {
    finishLoading('Initial Load')
  }, [])


  return (
    <main className={styles.main}>
      <div className={styles.flower}>

        <Scene />
      </div>
      <div className={styles.photos}>
        <Photos />
      </div>
    </main>
  )
}