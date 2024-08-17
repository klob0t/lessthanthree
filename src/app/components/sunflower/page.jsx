'use client'
import { Canvas } from '@react-three/fiber'
import Model from './model'
import { Environment } from '@react-three/drei'

export default function Scene() {
    return(
    <Canvas 
    style={{background: 'white'}}>
    <camera fov={120} near={0.1} far={1000} position={[0, 40, 0]}/>
         <hemisphereLight intensity={6} position={[0, 10, 3]}/>
         <Environment preset="sunset" />
        <Model />
    </Canvas>
    )
}