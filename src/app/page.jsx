'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Counter from './components/counter/page';
const Scene = dynamic(() => import('./components/flower/page'),)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isButton, setIsButton] = useState(false)
  const sceneRef = useRef(null);
  const button = useRef(null);
  const spanRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsButton(true);
    }, 4000);
  })
  const clickHandler = () => {
    setIsAnimating(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  useEffect(() => {
    if (isAnimating && sceneRef.current) {
      gsap.to(sceneRef.current, {
        opacity: 0,
        duration: 2,
        ease: "linear",
        stagger: 4,
      })
      gsap.to(sceneRef.current, {
        y: -1000,
        duration: 2,
        ease: "power4.in",
        stagger: 4,
      })
    }
  }, [isAnimating]);

  useEffect(() => {
    if (isButton) {
      gsap.to(button.current, {
        keyframes: {
          opacity: [0, 1],
          y: [100, 0],
          ease: "power4.out",
        },
        duration: 10,
        stagger: 5
      })
      gsap.to(spanRef.current, {
          y: 10,
          ease: "power1.inOut",
        duration: 1,
        repeat: -1,
        yoyo: true
      })
    }
  }, [isButton]);

  console.log(spanRef.current)

  return (
    <main className={styles.main}>
      {isLoading ?
        <div className={styles.canvas} ref={sceneRef}>
          <Scene />
          {isButton ?
            <div ref={button} className={styles.button} onClick={clickHandler}>Hello, Darling <div ref={spanRef} style={{ fontSize: "2em",lineHeight: "0.1em" }}>↓</div></div> : null}
        </div>
        : <Counter />}
    </main>
  )
}