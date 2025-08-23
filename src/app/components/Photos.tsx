'use client'
import { useEffect, useState } from 'react'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { TrackedImage } from '@/app/lib/utils/TrackedImage'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

interface ImageData {
   src: string
   alt: string
}

export default function Photos() {
   const { startLoading, finishLoading } = useLoadingStore()
   const [images, setImages] = useState<ImageData[]>([])
   // 1. Add a state to track if the component has mounted on the client
   const [isClient, setIsClient] = useState(false)

   // 2. Set the state to true once the component mounts
   useEffect(() => {
      setIsClient(true)
   }, [])

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
      <ResponsiveMasonry
         columnsCountBreakPoints={{ 350: 3, 750: 6, 900: 12 }}
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
                  quality={100}
               />
            ))}
         </Masonry>
      </ResponsiveMasonry>
   )
}