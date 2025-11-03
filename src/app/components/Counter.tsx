

'use client'
import React, { useMemo, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import styles from './counter.module.css'
// import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useTriggerStore } from '../lib/store/triggerStore'

gsap.registerPlugin(ScrollTrigger, SplitText)





export function calculateDays(): number {
   const today = new Date();
   const startDate = new Date('2022-08-27');
   const timeDiff = today.getTime() - startDate.getTime();
   return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}


function buildOdometer(value: number) {
   const str = String(value);
   const digits = str.split('').map((d) => parseInt(d, 10));
   const numDigits = digits.length;



   const ticks = digits.map((_, i) => {
      const placeValue = Math.pow(10, numDigits - 1 - i);
      return Math.floor(value / placeValue);
   });


   const reels = ticks.map((tickCount) => {
      const arr: number[] = [];

      const repeats = Math.ceil(tickCount / 10) + 1;
      for (let r = 0; r < repeats; r++) {
         for (let n = 0; n <= 9; n++) arr.push(n);
      }
      return arr;
   });

   return { digits, reels, ticks };
}




export default function CounterSlot() {
   const days = useMemo(() => calculateDays(), []);
   const { reels, ticks } = useMemo(() => buildOdometer(days), [days]);
   const botText = useRef<HTMLDivElement>(null)
   const topText = useRef<HTMLDivElement>(null)
   const ctaText = useRef<HTMLDivElement>(null)
   const container = useRef<HTMLDivElement>(null)
   const odometer = useRef<HTMLDivElement | null>(null)
   const triggerEl = useTriggerStore((s) => s.triggerEl)
   const reelRefs = useRef<Array<HTMLDivElement | null>>([]);

   useGSAP(() => {
      // require triggerEl to exist and at least the expected children
      if (!triggerEl) return

      let rafId: number | null = null
      let created = false
      const splits: Array<{ instance: InstanceType<typeof SplitText>, target: HTMLElement | null }> = []
      const createdTriggers: Array<ReturnType<typeof ScrollTrigger.create>> = []

      const trySetup = () => {
         if (!triggerEl) return

         // ensure the grid has the child sections we expect (hero, photos, letter)
         const children = Array.from(triggerEl.children) as HTMLElement[]
         // const heroTrig = children[0] ?? null
         const photoTrig = children[1] ?? null
         // const letterTrig = children[2] ?? null

         // not ready yet — wait a frame
         if (!photoTrig || !odometer.current || !reelRefs.current.length) {
            rafId = requestAnimationFrame(trySetup)
            return
         }

         if (created) return
         created = true

         // Prepare SplitText once (store instances to revert on cleanup)
         const topChars = new SplitText(topText.current!, { type: 'chars' })
         splits.push({ instance: topChars, target: topText.current })
         const botChars = new SplitText(botText.current!, { type: 'chars' })
         splits.push({ instance: botChars, target: botText.current })
         const ctaChars = new SplitText(ctaText.current!, { type: 'chars' })
         splits.push({ instance: ctaChars, target: ctaText.current })

         gsap.set(topChars.chars, { opacity: 0 })
         gsap.set(botChars.chars, { opacity: 0 })
         gsap.set(ctaChars.chars, { opacity: 0 })
         gsap.set(odometer.current, { opacity: 0 })

         // measure digit height (use first available reel/digit)
         const sampleReel = reelRefs.current.find(Boolean) as HTMLElement | undefined
         const digitEl = sampleReel?.querySelector<HTMLDivElement>('.digit')
         const digitHeight = Math.round(digitEl?.offsetHeight || 0)

         // Build a single timeline that animates all reels sequentially or in parallel
         const tl = gsap.timeline({
            scrollTrigger: {
               trigger: photoTrig,
               start: 'top top',
               // markers: true,
               end: 'bottom top',
               toggleActions: 'play reverse play reverse'
            }
         })

         // topChars reveal
         tl.to(topChars.chars, {
            opacity: 1,
            y: '0px',
            overwrite: true,
            stagger: { each: 0.06 }
         }).to(odometer.current, {
            opacity: 1,
            duration: 2,
            ease: 'power2.in'
         }, '>')
         // odometer reveal + reel animations are triggered by ScrollTrigger on photoTrig
         // create a ScrollTrigger that plays tl2 when photoTrig enters
         // animate each reel on tl2 (stagger or sequence as you like)
         reelRefs.current.forEach((reel, i) => {
            if (!reel) return
            const totalTicks = ticks[i] || 0
            const endY = -totalTicks * digitHeight
            // small offset so reels feel like odometer (rightmost moves more / later)
            const offset = i * 0.08
            tl.to(reel, {
               ease: 'power4.inOut',
               y: endY,
               duration: 3 + i * 0.2, // tune durations
               onStart: () => reel.classList.add('animating'),
               onComplete: () => reel.classList.remove('animating')
            }, offset).to(botChars.chars, {
               opacity: 1,
               y: '0px',
               overwrite: true,
               stagger: { each: 0.06 }
            }, '>-0.5').to(ctaChars.chars, {
               opacity: 1,
               y: '0px',
               overwrite: true,
               stagger: { each: 0.06 }
            },'>+0.8')
         })


      } // end trySetup

      rafId = requestAnimationFrame(trySetup)

      return () => {
         // cleanup RAF
         if (rafId != null) cancelAnimationFrame(rafId)
         // kill created ScrollTriggers
         createdTriggers.forEach((t) => {
            try { t.kill() } catch (e) { console.error(e) }
         })
         // revert SplitText instances
         splits.forEach(s => {
            try { s.instance.revert() } catch (e) { console.error(e) }
         })
         // remove animating classes
         reelRefs.current.forEach((r) => r && r.classList.remove('animating'))
         // kill all ScrollTrigger instances for safety (optional)
         // ScrollTrigger.getAll().forEach(t => t.kill())
      }
   }, { scope: container, dependencies: [days, triggerEl] /* include triggerEl */ })


   return (
      <div className={styles.container} ref={container}>
         <div className={styles.counter}>
            <p ref={topText}>It has been</p>
            <div className={styles.slotRow} aria-hidden="true" ref={odometer}>
               {reels.map((stack, i) => (
                  <div key={i} className={styles.reelMask} >
                     <div
                        className={styles.reel}
                        ref={(el) => { reelRefs.current[i] = el }}
                     >
                        {stack.map((n: number, k: number) => (
                           <div className={`digit ${styles.digit}`} key={k}>
                              {n}
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
            <p ref={botText}>days since we are together...</p>
            <p ref={ctaText}>i have something to tell you</p>
         </div>
      </div>
   );
}