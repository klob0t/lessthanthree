// src/app/components/Model.tsx

'use client'
import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type GLTFResult = GLTF & {
    nodes: {
        flower_flower_0: THREE.Mesh
        flower_flower_0_1: THREE.Mesh
    }
    materials: {
        flower: THREE.MeshStandardMaterial
        Material: THREE.MeshStandardMaterial
    }
}

export default function Model() {
    const flowerRef = useRef(null)
    const flowerMoveRef = useRef(null)
    const initPos = [0, 6, 0]
    const initRot = [-Math.PI / 0.496, 0, 0]


    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                markers: true
            }
        })

        gsap.to(flowerMoveRef.current.rotation, {
            y: Math.PI / 0.5,
            repeat: -1,
            ease: 'none',
            duration: 10
        })

        tl
            .to(flowerRef.current.position, {
                x: 2.5,
                y: 2,
                z: 1.7
            }).to(flowerRef.current.rotation, {
                x: -Math.PI / 2
            }, 0)

    })


    const path = '/3d/flower.glb'
    const gltf = useGLTF(path) as unknown as GLTFResult

    const { nodes, materials } = gltf || {}

    if (!nodes) {
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
        <group ref={flowerRef} position={initPos}>
            <group
                ref={flowerMoveRef}
                rotation={initRot}>
                <mesh castShadow receiveShadow geometry={nodes.mesh001.geometry} material={materials.RED} />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.mesh001_1.geometry}
                    material={materials.YELLOW}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.mesh001_2.geometry}
                    material={materials.LEAVES}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.mesh001_3.geometry}
                    material={materials.PUTIK}
                />
            </group>
        </group>
    )
}

useGLTF.preload('/3d/flower.glb')
