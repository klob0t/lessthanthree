'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import Counter from '@/app/components/counter/page'
const Scene = dynamic(() => import('./components/sunflower/page'))

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className={styles.main}>
      {isLoading ? 
        <Scene /> :
        <Counter />}
    </main>
  )
}