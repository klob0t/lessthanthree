import styles from './hero.module.css'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(SplitText)

export default function Hero() {
   const activeLoadersCount = useLoadingStore(state => state.activeLoaders.size)
   const dear = useRef<HTMLParagraphElement | null>(null)
   const muthia = useRef<HTMLParagraphElement | null>(null)
   const [isLoaded, setIsLoaded] = useState(false)


   useGSAP(() => {


      const dearChars = new SplitText(dear.current, { type: 'chars' })

      const muciaChars = new SplitText(muthia.current, { type: 'chars' })

      gsap.set(muciaChars.chars, {

         y: '5px'
      })



      if (activeLoadersCount === 0) {
         gsap.to(muciaChars.chars, {
            opacity: 1,
            y: '0px',
            overwrite: true,
            stagger: {
               each: 0.06
            }
         })
      }

   }, { dependencies: [activeLoadersCount] })

   return (
      <div className={styles.heroPage}>
         <p ref={dear}><span>D</span>ear</p>
         <div>
            <p ref={muthia}><span>M</span>uthia
            </p>
         </div>
      </div>
   )
}