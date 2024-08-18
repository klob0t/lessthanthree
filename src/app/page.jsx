'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Counter from './components/counter/page';
const Scene = dynamic(() => import('./components/sunflower/page'),)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const sceneRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
      setIsLoading(false);
      }, 2000)
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    if (isAnimating && sceneRef.current) {
      gsap.to(sceneRef.current, {
        opacity: 0,
        duration: 2,
        ease: "linear"
      });
      gsap.to(sceneRef.current, {
        y: -1000,
        duration: 2,
        ease: "power4.in",
      })
    }
  }, [isAnimating]);

  return (
    <main className={styles.main}>
      {isLoading ?
      <div ref={sceneRef}><Scene /></div>: <Counter />}

        {/* // <div ref={sceneRef}>
        //   <Scene />
        // </div> :
        // <div>
        //   <Counter />
        // </div>} */}
    </main>
  )
}
