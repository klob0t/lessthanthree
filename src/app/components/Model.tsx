// src/app/components/Model.tsx

'use client'
import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
    nodes: {
        flower_flower_0?: THREE.Mesh
        flower_flower_0_1?: THREE.Mesh
    }
    materials: {
        flower?: THREE.MeshStandardMaterial
        Material?: THREE.MeshStandardMaterial
    }
}

export default function Model() {
    const path = '/3d/flower.glb'
    const gltf = useGLTF(path) as unknown as GLTFResult

    const { nodes, materials } = gltf || {}
    const hasMeshes = !!(nodes?.flower_flower_0 || nodes?.flower_flower_0_1)

    if (!hasMeshes) {
        return (
            <group>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial />
                </mesh>
            </group>
        )
    }

    return (
        <group dispose={null}>
            <group scale={0.012}>
                {nodes?.flower_flower_0 && (
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.flower_flower_0.geometry}
                        material={materials?.flower}
                    />
                )}
                {nodes?.flower_flower_0_1 && (
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.flower_flower_0_1.geometry}
                        material={materials?.Material}
                    />
                )}
            </group>
        </group>
    )
}

// preload — path MUST match the above `path` exactly
useGLTF.preload('/3d/flower.glb')
