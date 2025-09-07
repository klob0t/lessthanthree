'use client'
import React, { useMemo, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import styles from './counter.module.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

// CSS is included directly in the component via a <style> tag.

/* ---------- HELPER FUNCTIONS ---------- */

function calculateDays(): number {
   const today = new Date(); // Use current date for a dynamic counter
   const startDate = new Date('2022-08-27');
   const timeDiff = today.getTime() - startDate.getTime();
   return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Builds the data for the odometer, creating a variable number of
 * digit repetitions for each reel to simulate realistic spinning.
 */
function buildOdometer(value: number) {
   const str = String(value);
   const digits = str.split('').map((d) => parseInt(d, 10));
   const numDigits = digits.length;

   // Calculate the total "ticks" for each wheel. This is the core of the realistic effect.
   // The units digit ticks `value` times, the tens digit `value/10` times, etc.
   const ticks = digits.map((_, i) => {
      const placeValue = Math.pow(10, numDigits - 1 - i);
      return Math.floor(value / placeValue);
   });

   // Create reels with enough numbers to cover the total ticks.
   const reels = ticks.map((tickCount) => {
      const arr: number[] = [];
      // +1 gives a buffer. Ceil rounds up to ensure we have enough sets of 10.
      const repeats = Math.ceil(tickCount / 10) + 1;
      for (let r = 0; r < repeats; r++) {
         for (let n = 0; n <= 9; n++) arr.push(n);
      }
      return arr;
   });

   return { digits, reels, ticks };
}


/* ---------- REACT COMPONENT ---------- */

export default function OptimizedCounter({ trigger }: { trigger: React.RefObject<HTMLElement | null> }) {
   const days = useMemo(() => calculateDays(), []);
   const { reels, ticks } = useMemo(() => buildOdometer(days), [days]);
   const botText = useRef<HTMLDivElement>(null)

   const topText = useRef<HTMLDivElement>(null)

   const container = useRef<HTMLDivElement>(null);
   const reelRefs = useRef<Array<HTMLDivElement | null>>([]);

   useGSAP(
      () => {
         if (!reelRefs.current) return;

         reelRefs.current.forEach((reel, i) => {
            if (!reel) return;

            const totalDigitsInReel = reels[i].length;
            // The final resting position is determined by the total ticks for this wheel.
            const totalTicks = ticks[i];

            // Calculate the exact yPercent to land on that tick index.
            const finalYPercent = -(totalTicks / totalDigitsInReel) * 100

            const topChars = new SplitText(topText.current, { type: 'chars' })
            const botChars = new SplitText(botText.current, { type: 'chars' })

            gsap.set(topChars.chars, {
               opacity: 0, y: '2px'
            })
            gsap.set(botChars.chars, {
               opacity: 0, y: '2px'
            })
            gsap.set(reels, {
               opacity: 0
            })

            ScrollTrigger.create({
               trigger: trigger.current,
               start: 'top top',
               markers: true,
               end: 'bottom top',
               onEnter: () => {

                  const tl = gsap.timeline()

                  tl.to(topChars.chars, {
                     opacity: 1,
                     y: '0px',
                     overwrite: true,
                     stagger: {
                        each: 0.06
                     }
                  }).to(reel, {
                     opacity: 1,
                     yPercent: finalYPercent,
                     // All animations have the SAME duration.
                     // This makes the wheels with more ticks (a larger yPercent change) spin faster.
                     duration: 4,
                     ease: 'power4.inOut',
                  },'>').to(botChars.chars, {
                     opacity: 1,
                     y: '0px',
                     overwrite: true,
                     stagger: {
                        each: 0.06
                     }
                  }, '>-1.5')
               },
               onLeaveBack: () => {
                  gsap.to(topChars.chars, {
                     opacity: 0,
                     y: '2px',
                     overwrite: true
                  })
                  gsap.to(botChars.chars, {
                     opacity: 0,
                     y: '2px',
                     overwrite: true
                  })
               }
            })
         });
      },
      { scope: container, dependencies: [days] }
   );

   return (
      <div className={styles.container} ref={container}>

         <p ref={topText}>It has been</p>
         <div className={styles.counter}>
            <div className={styles.slotRow} aria-hidden="true">
               {reels.map((stack, i) => (
                  <div key={i} className={styles.reelMask}>
                     <div
                        className={styles.reel}
                        ref={(el) => (reelRefs.current[i] = el)}
                     >
                        {stack.map((n: number, k: number) => (
                           <div className={styles.digit} key={k}>
                              {n}
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
            <p ref={botText}>days since we are together...</p>
         </div>
      </div>
   );
}