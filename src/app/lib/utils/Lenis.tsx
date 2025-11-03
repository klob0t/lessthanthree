'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export default function LenisProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.05,
      wheelMultiplier: 1,
      // touchMultiplier: 0, // <- this disables touch; leave commented or set >0
    })

    const scroller =
      (document.scrollingElement as HTMLElement | null) || document.documentElement

    // Tell ScrollTrigger how to control/read the scroll position
    ScrollTrigger.scrollerProxy(scroller as Element, {
      scrollTop(value?: number) {
        if (arguments.length) {
          // Instant jump for ST internal measures (no smoothing)
          lenis.scrollTo(value as number, { immediate: true })
        }
        return window.scrollY || scroller.scrollTop || 0
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      pinType:
        getComputedStyle(scroller).transform !== 'none' ? ('transform' as const) : ('fixed' as const),
    })

    // Default all triggers to use our scroller
    ScrollTrigger.defaults({ scroller: scroller as Element })

    // Keep ScrollTrigger in sync with Lenis
    const onLenisScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onLenisScroll)

    // Drive Lenis with GSAP's ticker (GSAP gives seconds; Lenis wants ms)
    const ticker = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    // Initial measure
    ScrollTrigger.refresh()

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(ticker)
      lenis.off('scroll', onLenisScroll)
      lenis.destroy()
      // No need to unset scrollerProxy explicitly
    }
  }, [])

  return null
}
