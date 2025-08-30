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
      if (!trigger.current || !photoPageRef.current) return

      const el = gsap.utils.toArray(trigger.current.children)
      const imageArray = gsap.utils.toArray<HTMLImageElement>(
         photoPageRef.current?.querySelectorAll("img") || []
      )
      gsap.fromTo(imageArray, {
         opacity: 0
      }, {
         opacity: 0.5,
         stagger: {
            each: 0.05,
            from: 'random'
         },
         scrollTrigger: {
            start: 'top top',
            markers: true,
            trigger: photoPageRef.current,
            toggleActions: 'play reverse play reverse',
            pin: photoPageRef.current,
            pinSpacing: true,
            invalidateOnRefresh: true,
            anticipatePin: 1
         }
      })

      ScrollTrigger.refresh()

      return () => {
         // cleanup: kill the tween and its ScrollTrigger if component updates/unmounts
         tween.scrollTrigger?.kill();
         tween.kill();
      };
   }, { dependencies: [photoPageRef.current], revertOnUpdate: true })

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
            columnsCountBreakPoints={{ 350: 3, 750: 6, 900: 7 }}
         >
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
                     style={{ width: '100%', height: 'auto', filter: 'grayscale(1)', opacity: 0.4 }}
                  />
               ))}
            </Masonry>
         </ResponsiveMasonry>
      </div>
   )
}