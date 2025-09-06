import { useRef, useState } from 'react'
import styles from './counter.module.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Counter({ trigger }: { trigger: React.RefObject<HTMLElement | null> }) {
  const [days, setDays] = useState<number>(0)
  const topText = useRef<HTMLParagraphElement | null>(null)
  const counting = useRef<HTMLParagraphElement | null>(null)
  const botText = useRef<HTMLParagraphElement | null>(null)

  const calculateDays = (): number => {
    const today = new Date();
    const startDate = new Date('2022-08-27');

    // explicit numeric timestamps
    const timeDiff = today.getTime() - startDate.getTime(); // number
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    setDays(daysPassed);
    return daysPassed; // return the computed value, not the state variable
  }

  useGSAP(() => {
    if (!trigger || !trigger.current) return

    const daysCount = calculateDays()

    const topChars = new SplitText(topText.current, { type: 'chars' })
    const botChars = new SplitText(botText.current, { type: 'chars' })

    gsap.set(topChars.chars, {
      opacity: 0,
      y: '2px'
    })

    gsap.set(botChars.chars, {
      opacity: 0,
      y: '2px'
    })
    gsap.set(counting.current, {
      opacity: 0
    })

    ScrollTrigger.create({
      trigger: trigger.current,
      markers: true,
      start: 'top top',
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
        }).to(counting.current, {
          opacity: 1,
          duration: 2,
          ease: 'power2.in'
        }, '>').to(counting.current, {
          duration: 3,
          textContent: daysCount,
          roundProps: "textContent",
          ease: "power4.inOut",
        }, '<').to(botChars.chars, {
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
        gsap.to(counting.current, {
          duration: 1,
          opacity: 0,
          textContent: 0,
          roundProps: "textContent",
          ease: "power4.out",
          overwrite: true
        })
      }
    })

    // gsap.to(counting.current, {
    //   duration: 4,
    //   textContent: daysCount,
    //   roundProps: "textContent",
    //   ease: "power4.inOut",
    //   opacity: 1,
    //   scrollTrigger: {
    //     trigger: trigger.current,
    //     markers: true,
    //     start: 'top top',
    //     end: 'bottom top'
    //   }
    // })
  }, { dependencies: [days, trigger.current] })


  return (
    <div className={styles.counter}>
      <p ref={topText}>It has been</p>
      <h1 ref={counting}>0</h1>
      <p ref={botText}>days since we are together...</p>
    </div>
  )
}