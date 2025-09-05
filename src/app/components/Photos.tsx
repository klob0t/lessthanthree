'use client'
import { useEffect, useRef, useState } from 'react'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { TrackedImage } from '@/app/lib/utils/TrackedImage'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import styles from './photo.module.css'

gsap.registerPlugin(ScrollTrigger)

interface ImageData {
   src: string
   alt: string
}

export default function Photos({ trigger }: { trigger: React.RefObject<HTMLElement | null> }) {
   const { startLoading, finishLoading } = useLoadingStore()
   const [images, setImages] = useState<ImageData[]>([])
   const [isClient, setIsClient] = useState(false)
   const imagesRef = useRef<HTMLElement>(null)
   const photoPageRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      setIsClient(true)
   }, [])

   useGSAP(() => {
      if (!trigger.current || !photoPageRef.current || images.length === 0) return

      const el = gsap.utils.toArray(trigger.current.children || [])
      const pin = photoPageRef.current.querySelector('div')

      console.log(pin) 
      const imageArray = gsap.utils.toArray<HTMLImageElement>(
         photoPageRef.current.querySelectorAll("img") || []
      )

      gsap.set(photoPageRef.current, {
         opacity: 1
      })

      // 1. Store the ScrollTrigger instance in a variable
      const st = ScrollTrigger.create({
         trigger: photoPageRef.current,
         start: 'top top',
         endTrigger: el[3],
         end: 'bottom center',
         pin: photoPageRef.current,
         markers: true,
         invalidateOnRefresh: true,

         onEnter: () => gsap.to(imageArray, {
            opacity: 0.75,
            overwrite: true,
            stagger: {
               each: 0.05,
               from: 'random'
            }
         }),
         onLeaveBack: () => gsap.to(imageArray, {
            opacity: 0,
            overwrite: true,
            stagger: {
               each: 0.05,
               from: 'random'
            }
         })
      })

      ScrollTrigger.refresh()

   }, { dependencies: [photoPageRef.current, images, trigger.current] })

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

         <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 3, 750: 6, 900: 7 }}>
            <Masonry gutter='1rem'>
               {images.map((image) => (
                  <TrackedImage
                     key={image.src}
                     src={image.src}
                     alt={image.alt}
                     width={0}
                     height={0}
                     loading='eager'
                     sizes='100vw'
                     style={{ width: '100%', height: 'auto', filter: 'grayscale(1)' }}
                  />
               ))}
            </Masonry>
         </ResponsiveMasonry>
      </div>
   )
}