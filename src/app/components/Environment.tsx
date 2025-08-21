// LowResEnv.tsx
'use client'
import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import { PMREMGenerator } from 'three'

export default function Environment({ url = '/images/hdri/sunset.hdr' }: { url?: string }) {
  const { gl, scene } = useThree()
  const hdr = useLoader(RGBELoader, url)

  useEffect(() => {
    if (!hdr) return
    const pmrem = new PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const envMap = pmrem.fromEquirectangular(hdr).texture
    scene.environment = envMap

    // cleanup properly
    hdr.dispose()
    pmrem.dispose()

    return () => {
      // remove env and free resources
      scene.environment = null
      envMap?.dispose()
    }
  }, [gl, scene, hdr])

  return null
}
