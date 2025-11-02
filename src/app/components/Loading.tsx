'use client'

import styles from './loading.module.css'
import { useLoadingStore } from '@/app/lib/store/loadingStore'

type LoaderSummary = {
  id: string
  count: number
}

const IMAGE_PREFIX = 'image-'

export default function Loading() {
  const activeLoaders = useLoadingStore((state) => state.activeLoaders)
  const pendingCount = activeLoaders.size

  if (pendingCount === 0) {
    return null
  }


  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
          <p>&lt;3</p>
      </div>
    </div>
  )
}
