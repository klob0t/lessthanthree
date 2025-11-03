// '@/app/components/Hero.tsx'
'use client'
import styles from './hero.module.css'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { useStartFlowStore } from '@/app/lib/store/buttonStore'

// ✅ Register BOTH plugins before any ScrollTrigger calls
gsap.registerPlugin(SplitText, ScrollTrigger)

export default function Hero() {
   const isLoaded = useLoadingStore(s => s.activeLoaders.size === 0)
   const enterSignal = useStartFlowStore(s => s.enterSignal)
   const heroPage = useRef<HTMLDivElement | null>(null)
   const dear = useRef<HTMLHeadingElement | null>(null)
   const muthia = useRef<HTMLHeadingElement | null>(null)

   useGSAP(() => {
      // ✅ Safe to call now (after registration, on client)
      if (typeof ScrollTrigger.normalizeScroll === 'function') {
         ScrollTrigger.normalizeScroll(true)
         ScrollTrigger.config({ ignoreMobileResize: true })
      }

      if (!isLoaded || !dear.current || !muthia.current || !heroPage.current) return
      if (enterSignal === 0) return

      const dearChars = new SplitText(dear.current, { type: 'chars' })
      const muthiaChars = new SplitText(muthia.current, { type: 'chars' })

      gsap.set([dearChars.chars, muthiaChars.chars], { autoAlpha: 0 })

      const intro = gsap.timeline({ defaults: { ease: 'none' } })
         .to(heroPage.current, { autoAlpha: 1, overwrite: true })
         .to(dearChars.chars, { autoAlpha: 1, duration: 0.01, stagger: { each: 0.2 } }, '+=3')
         .to(muthiaChars.chars, { autoAlpha: 1, duration: 0.01, stagger: { each: 0.2 } }, '>')

      // …your ScrollTrigger parallax tweens…

      ScrollTrigger.matchMedia({
         // Mobile / touch
         '(max-width: 768px)': () => {
            gsap.to(dear.current!, {
               yPercent: -25,            // smaller move for short viewports
               ease: 'none',
               force3D: true,
               scrollTrigger: {
                  trigger: heroPage.current!,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 1,            // more smoothing on mobile
                  invalidateOnRefresh: true,
               },
            })
         },

         // Desktop
         '(min-width: 769px)': () => {
            gsap.to(dear.current!, {
               yPercent: 300,
               ease: 'none',
               force3D: true,
               scrollTrigger: {
                  trigger: heroPage.current!,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.05,
                  invalidateOnRefresh: true,
                  pinSpacing: false,
               },
            })
         },
      })

      return () => {
         dearChars.revert()
         muthiaChars.revert()
         intro.kill()
         ScrollTrigger.getAll().forEach(st => st.kill())
      }
   }, { dependencies: [isLoaded, enterSignal], scope: heroPage })

   return (
      <div className={styles.heroPage} ref={heroPage}
         style={{
            opacity: 0
         }}
      >
         <div className={styles.heroWrapper}>
            <div><h1 ref={dear}><span>D</span>ear</h1></div>
            <div
               style={{
                  zIndex: 2
               }}
            ><h1 ref={muthia}><span>M</span>uthia</h1></div>
         </div>
      </div>
   )
}
