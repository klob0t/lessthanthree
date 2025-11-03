// app/components/Loading.tsx
'use client'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useStartFlowStore } from '@/app/lib/store/buttonStore'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './loading.module.css'

export default function Loading() {
   const size = useLoadingStore((s) => s.activeLoaders.size)

   const startSequence = useStartFlowStore((s) => s.startSequence)
   const exitSignal = useStartFlowStore((s) => s.exitSignal)

   const [phase, setPhase] = useState<'idle' | 'fading' | 'gone'>('idle')

   // smooth the count (optional)

   // When exitSignal increments, run the exit animation then unmount
   useEffect(() => {
      if (exitSignal === 0) return
      setPhase('fading')
      const id = window.setTimeout(() => setPhase('gone'), 400) // match your CSS/GSAP duration
      return () => window.clearTimeout(id)
   }, [exitSignal])

   if (phase === 'gone') return null

   return (
      <div 
        style={{
          display: 'fixed',
          width: '100lvw',
          height: '100lvh',
          inset: 0,
          zIndex: 3
        }}>
         <div
            style={{
               display: 'flex',
               width: '100lvw',
               height: '100lvh',
               justifyContent: 'center',
               alignItems: 'center',
               flexDirection: 'column',
               flexGrow: 1,
            }}
         >
            <button
               style={{
                  background: 'var(--background)',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--serif)',
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1rem',
                  color: 'var(--text)',
                  alignItems: 'center'
               }}

               type="button"
               onClick={() => startSequence({ exitDelay: 0, enterDelay: 1000 })}
               disabled={size > 0}
               aria-disabled={size > 0}
            >
               <div className={`${styles.heart} ${size > 0 ? styles.loading : styles.loaded}`}>
                  <Image
                     src='/images/heart-emoji.png'
                     alt='heart'
                     width={0}
                     height={0}
                     loading='eager'
                     decoding="async"
                     sizes='60px'
                     quality={5}
                     style={{ width: '100%', height: 'auto' }}
                  />
               </div>
               <div>
                  {size > 0 ? <div>Loading</div> : <div>Open</div>}
               </div>
            </button >

         </div >

      </div>
   )
}
