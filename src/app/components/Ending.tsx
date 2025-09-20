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

         const children = Array.from(triggerEl.children) as HTMLElement[]
         const letterTrig = children[3] ?? null
         if (!letterTrig) return

         const texts = new SplitText(endingPageRef.current!.querySelectorAll('h1'), { type: 'chars' })

         gsap.from(texts.chars, {
            autoAlpha: 0,
            y: 0,
            stagger: { each: 0.1, from: 'start' },
            duration: 0.01,
            ease: 'power3.out',
            scrollTrigger: {
               trigger: endingPageRef.current,
               start: 'top center',
               end: 'bottom top',
               markers: false,
            }
         })

      },
      { dependencies: [triggerEl, endingPageRef.current], scope: endingPageRef } 
   )

   return (
      <div className={styles.endingPage} ref={endingPageRef}>
         <div>
            <h1>
               Year after year, I want to keep saying happy anniversary, to you, and <u>only you</u>.
               <br />
            </h1>
         </div>
         <div>
            <h1>
               Yours forever,
               <br />
               Airlangga
            </h1>
         </div>
      </div>
   )
}