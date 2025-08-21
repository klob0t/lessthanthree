//src/app/components/Scene.tsx

'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Model from './Model'
import Environment from './Environment'
import { OrbitControls } from '@react-three/drei'

export default function Scene() {
    return (
        <Canvas camera={{ position: [-1, 5, 4], fov: 30 }}>
            <Suspense fallback={null}>
                <Environment url="/images/hdri/sunrise.hdr" />
                <Model />
            </Suspense>
            <OrbitControls />
        </Canvas>
    )
}