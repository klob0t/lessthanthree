// '@/app/components/Photos.tsx'
'use client'
import { useEffect, useRef, useState } from 'react'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { TrackedImage } from '@/app/lib/utils/TrackedImage'
import CounterSlot from './Counter'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import styles from './photo.module.css'

gsap.registerPlugin(ScrollTrigger)

interface ImageData {
   src: string
   alt: string
}

export default function Photos() {
   const { startLoading, finishLoading } = useLoadingStore()
   const [images, setImages] = useState<ImageData[]>([])
   const [isClient, setIsClient] = useState(false)
   const photoPageRef = useRef<HTMLDivElement>(null)
   const pinRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      setIsClient(true)
   }, [])

   useGSAP(() => {
      if (!photoPageRef.current || images.length === 0) return

      const imageArray = gsap.utils.toArray<HTMLImageElement>(
         photoPageRef.current.querySelectorAll("img") || []
      )

      ScrollTrigger.create({
         trigger: photoPageRef.current,
         start: 'top top',
         end: 'bottom top',
         pin: photoPageRef.current,
         pinSpacing: false,
         invalidateOnRefresh: true,

         onEnter: () => gsap.to(imageArray, {
            autoAlpha: 0.3,
            overwrite: true,
            stagger: {
               each: 0.05,
               from: 'random'
            }
         }),
         onLeaveBack: () => gsap.to(imageArray, {
            autoAlpha: 0,
            overwrite: true,
            stagger: {
               each: 0.006,
               from: 'random'
            }
         })
      })

      ScrollTrigger.refresh()

   }, { dependencies: [photoPageRef.current, images] })


   useEffect(() => {
      const fetchImages = async () => {
         try {
            startLoading('Images Lists')
            const res = await fetch('/api/images')
            if (!res.ok) {
               throw new Error(`Failed to fetch images: ${res.statusText}`)
            }
            const fetchedImagePaths: string[] = await res.json()
            const formattedImages: ImageData[] = fetchedImagePaths.map((path, index) => ({
               src: path,
               alt: `Work image ${index + 1}`
            }))
            setImages(formattedImages)
         } catch (err) {
            console.error(`Failed to fetch images: ${err}`)
            setImages([])
         } finally {
            finishLoading('Images Lists')
         }
      }
      fetchImages()
   }, [startLoading, finishLoading])

   if (!isClient) {
      return null
   }

   return (
      <div className={styles.photoPage} ref={photoPageRef}>
         <CounterSlot />
         <div className={styles.pinWrapper} ref={pinRef}>
            <ResponsiveMasonry
               columnsCountBreakPoints={{ 350: 3, 750: 6, 900: 9 }}>
               <Masonry gutter='1rem'>
                  {images.map((image) => (
                     <TrackedImage
                        key={image.src}
                        src={image.src}
                        alt={image.alt}
                        width={0}
                        height={0}
                        loading='lazy'
                        decoding="async"
                        sizes='20vw'
                        quality={5}
                        style={{ width: '100%', height: 'auto' }}
                     />
                  ))}
               </Masonry>
            </ResponsiveMasonry>
         </div>
      </div>
   )
}