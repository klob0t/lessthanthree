// src/app/components/LenisProvider.tsx
'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export default function LenisProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // register plugin — MUST run before using ScrollTrigger APIs
    try {
      gsap.registerPlugin(ScrollTrigger)
    } catch (e) {
      // harmless if already registered, but log otherwise
      // eslint-disable-next-line no-console
      console.warn('gsap.registerPlugin(ScrollTrigger) failed or already registered', e)
    }

    // quick sanity check to help debugging
    // eslint-disable-next-line no-console
    console.log('gsap, ScrollTrigger:', !!gsap, !!ScrollTrigger, typeof ScrollTrigger === 'object' || typeof ScrollTrigger === 'function')

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })

    const scroller = document.scrollingElement || document.documentElement

    // Ensure ScrollTrigger is available
    if (!ScrollTrigger || typeof ScrollTrigger.scrollerProxy !== 'function') {
      // eslint-disable-next-line no-console
      console.error('ScrollTrigger not available. Did gsap.registerPlugin(ScrollTrigger) succeed?')
      return () => {
        lenis.destroy()
      }
    }

    ScrollTrigger.scrollerProxy(scroller as Element, {
      scrollTop(value?: number) {
        if (arguments.length) lenis.scrollTo(value as number)
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      pinType: (scroller as HTMLElement).style.transform ? 'transform' : 'fixed',
    })

    const onScroll = () => {
      ScrollTrigger.update()
    }
    lenis.on('scroll', onScroll)

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      // clear the proxy (defensive)
      try {
        ScrollTrigger.scrollerProxy(scroller as Element, null as any)
      } catch (e) {
        // ignore
      }
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return null
}
