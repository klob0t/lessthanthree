// '@/app/components/Hero.tsx'

import styles from './hero.module.css'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(SplitText)

export default function Hero() {
   const isLoaded = useLoadingStore(state => state.activeLoaders.size === 0)
   const heroPage = useRef<HTMLDivElement | null>(null)
   const dear = useRef<HTMLParagraphElement | null>(null)
   const muthia = useRef<HTMLParagraphElement | null>(null)


   useGSAP(() => {
      if (!isLoaded || !dear.current || !muthia.current || !heroPage.current) return


      const dearChars = new SplitText(dear.current, { type: 'chars' })
      const muthiaChars = new SplitText(muthia.current, { type: 'chars' })

      gsap.set(dearChars.chars, { autoAlpha: 0 })
      gsap.set(muthiaChars.chars, { autoAlpha: 0 })

      const tl = gsap.timeline()

      tl.to(heroPage.current, {
         autoAlpha: 1,
         overwrite: true,
      }).to(dearChars.chars, {
         autoAlpha: 1,
         duration: 0.01, // Each character appears instantly
         stagger: {
            each: 0.2, // This controls the typing speed
         }
      }, '+=3').to(muthiaChars.chars, {
         autoAlpha: 1,
         duration: 0.01, // Each character appears instantly
         stagger: {
            each: 0.2, // This controls the typing speed
         }
      }, '>+0.6')

      return () => {
         dearChars.revert();
         muthiaChars.revert();
      }

   }, { dependencies: [isLoaded] })

   return (
      <div className={styles.heroPage} ref={heroPage}>
         <p ref={dear}><span>D</span>ear</p>
         <div>
            <p ref={muthia}><span>M</span>uthia</p>
         </div>
      </div>
   )
}