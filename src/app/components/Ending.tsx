import { useGSAP } from '@gsap/react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import styles from './ending.module.css'
import { useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Ending() {
   const triggerEl = useTriggerStore((s) => s.triggerEl)
   const endingPageRef = useRef<HTMLDivElement | null>(null)

   useGSAP(
      () => {
         if (!triggerEl || !endingPageRef.current) return

         const splitTargets = gsap.utils.toArray<HTMLSpanElement>(
            endingPageRef.current.querySelectorAll('span')
         )

         if (splitTargets.length === 0) return

         const splitInstances = splitTargets.map((span) =>
            new SplitText(span, { type: 'words,chars' })
         )

         const timeline = gsap.timeline({
            defaults: { duration: 0.02, ease: 'power3.out' },
            scrollTrigger: {
               trigger: endingPageRef.current,
               start: 'top center',
               end: 'bottom top',
               toggleActions: 'play none none reverse',
            }
         })

         splitInstances.forEach((split, index) => {
            timeline.from(
               split.chars,
               {
                  autoAlpha: 0,
                  delay: 0.3,
                  stagger: { each: 0.06, from: 'start' }
               },
               index === 0 ? 0 : '>'
            )
         })

         return () => {
            timeline.scrollTrigger?.kill()
            timeline.kill()
            splitInstances.forEach((instance) => instance.revert())
         }

      },
      { dependencies: [triggerEl, endingPageRef.current], scope: endingPageRef }
   )

   return (
      <div className={styles.endingPage} ref={endingPageRef}>
         <div className={styles.endingWrapper}>
            <p>
               <span>Year after year,&nbsp;</span>
               <span>I want to keep saying happy anniversary&nbsp;</span>
               <span>to you,&nbsp;</span>
               <span>and only you.</span>
            </p>
            <p>
               <span>Yours forever,&nbsp;</span>
               <span><br />Airlangga</span>
            </p>
         </div>
      </div>
   )
}
