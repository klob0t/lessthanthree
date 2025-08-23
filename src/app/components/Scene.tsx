// src/app/components/Scene.tsx

'use client'
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import Model from './Model'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// function PointCamera({ controlsRef }: { controlsRef?: ControlsRef }) {
//     const { camera } = useThree()

//     useEffect(() => {
//         const camPos = new THREE.Vector3(0, 8, 12)
//         const target = new THREE.Vector3(0, 1, -2)

//         camera.position.copy(camPos)
//         camera.lookAt(target)

//         if (controlsRef?.current) {
//             const controls = controlsRef.current
//             if (typeof controls.setLookAt === 'function') {
//                 controls.setLookAt(camPos.x, camPos.y, camPos.z, target.x, target.y, target.z, false)
//             }
//             else if (controls.target && typeof controls.update === 'function') {
//                 controls.target.set(target.x, target.y, target.z)
//                 controls.update()
//             }
//             else if (typeof controls.setTarget === 'function') {
//                 (controls as any).setTarget(target.x, target.y, target.z)
//             }
//         }
//     }, [camera, controlsRef])

//     return null
// }

export default function Scene() {


    return (
        <Canvas
            shadows
            camera={{ fov: 55, position: [0, 7, 0] }}
            style={{ 
                backgroundColor: 'var(--background)',
                position: 'fixed' }}
            gl={{
                toneMapping: THREE.ACESFilmicToneMapping,
                outputColorSpace: THREE.SRGBColorSpace,
            }}
        >
            <Suspense fallback={null}>
                <Environment files='/images/hdri/sunrise.jpg' />
                <Model />
                <axesHelper args={[5]} />
            </Suspense>
        </Canvas>
    )
}
