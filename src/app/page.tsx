'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className={styles.main}>
      <Scene />
      <p>hello</p>
    </main>
  )
}