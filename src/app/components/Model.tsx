import { useGLTF } from '@react-three/drei'
import React from 'react'


export default function Model() {
    const { nodes } = useGLTF('/3d/flower.glb')
    return (
        <group>
            <mesh>

            </mesh>
        </group>
    )
}