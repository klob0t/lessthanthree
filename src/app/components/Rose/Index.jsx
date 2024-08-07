'use client'
import { Canvas } from '@react-three/fiber'
import Model from './Model'
import { Environment } from '@react-three/drei'

export default function Scene() {
    return(
    <Canvas 
    style={{background: 'white'}}
    camera={{ fov: 64, position: [-5, 2, 0] }}>
         <ambientLight intensity={1} position={[0, 5, 3]}/>
         <Environment preset="city" />
        <Model />
    </Canvas>
    )
}