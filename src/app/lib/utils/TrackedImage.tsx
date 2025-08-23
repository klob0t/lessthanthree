'use client'
import Image, { ImageProps } from 'next/image'
import { useEffect, useCallback, SyntheticEvent, useRef } from 'react'
import { useLoadingStore } from '@/app/lib/store/loadingStore'

type NextImageOnLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => void
type NextImageOnError = (event: SyntheticEvent<HTMLImageElement, Event>) => void

interface TrackedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  onLoad?: NextImageOnLoad
  onError?: NextImageOnError
}

export const TrackedImage = (props: TrackedImageProps) => {
  const { startLoading, finishLoading } = useLoadingStore()
  const { src, alt = '', onLoad, onError, ...rest } = props

  const loaderId = `image-${src?.toString() || 'unknown'}`

  const isFinishedRef = useRef(false)

  const safeFinishLoading = useCallback(() => {
    if (!isFinishedRef.current) {
      finishLoading(loaderId)
      isFinishedRef.current =true
    }
  }, [finishLoading, loaderId])


  useEffect(() => {
    if (!src) return


    isFinishedRef.current = false

    startLoading(loaderId)

    return () => {
      safeFinishLoading()
    }
  }, [src, startLoading, loaderId, safeFinishLoading])
  
  const handleLoadingComplete: NextImageOnLoad = useCallback((event) => {
    safeFinishLoading()

    if (onLoad) {
      onLoad(event)
    }
  }, [safeFinishLoading, onLoad])

  const handleError: NextImageOnError = useCallback((event) => {
    safeFinishLoading()

    if (onError) {
      onError(event)
    }
  }, [safeFinishLoading, onError])

  if (!src) {
    return null
  }

  return (
    <Image 
      {...rest}
      src={src}
      alt={alt}
      onLoad={handleLoadingComplete}
      onError={handleError}
    />
  )
}