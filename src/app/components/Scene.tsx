// src/app/components/Scene.tsx
'use client'
import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame, } from '@react-three/fiber'
import { Bvh, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing'
import { useTriggerStore } from '@/app/lib/store/triggerStore'

gsap.registerPlugin(ScrollTrigger)

type TimelineWithScroll = gsap.core.Timeline & { scrollTrigger?: ScrollTrigger | null }

interface GLTFResult {
    nodes: {
        mesh001: THREE.Mesh
        mesh001_1: THREE.Mesh
        mesh001_2: THREE.Mesh
    }
    materials: {
        LEAVES: THREE.MeshStandardMaterial
        RED: THREE.MeshStandardMaterial
        STEM: THREE.MeshStandardMaterial
    }
}

export function RotatorUseFrame({ refGroup }: { refGroup: React.RefObject<THREE.Group | null> }) {
    useFrame((_, delta) => {
        const g = refGroup.current
        if (!g) return
        g.rotation.y += delta * (Math.PI * 0.2) // rad/s
    })
    return null
}

export default function Scene() {
    const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult
    const modelGroupRef = useRef<THREE.Group>(null)
    const rotationGroupRef = useRef<THREE.Group>(null)
    const targetRef = useRef<THREE.Object3D>(undefined)
    const triggerEl = useTriggerStore((s) => s.triggerEl)
    const container = useRef<HTMLDivElement>(null)
    const initRot: [number, number, number] = [Math.PI / 0.5, 0, 0];
    const isLoaded = useLoadingStore(state => state.activeLoaders.size === 0)

    useGSAP(() => {
        // This initial log is still useful for debugging
        console.log('useGSAP effect running...', {
            triggerEl: !!triggerEl,
            isLoaded,
            nodes: !!nodes,
            modelRef: !!modelGroupRef.current // The key value we are watching
        });

        // The dependency check now works perfectly
        if (!triggerEl || !isLoaded || !nodes || !modelGroupRef.current) {
            console.log('Aborting: Dependencies not ready.');
            return;
        }

        const children = Array.from(triggerEl.children) as HTMLElement[];
        const heroTrig = children[0] ?? null;
        const photoTrig = children[1] ?? null;

        if (!heroTrig || !photoTrig) {
            console.warn("GSAP triggers not found inside triggerEl. Final check failed.");
            return;
        }

        console.log('✅ All dependencies met! Setting up GSAP context.');
        const ctx = gsap.context(() => {
            const model = modelGroupRef.current;
            gsap.set(model.position, { x: 0, y: 7, z: 0 });
            gsap.set(model.scale, { x: 0, y: 0, z: 0 });

            gsap.to(model.scale, {
                x: 1, y: 1, z: 1,
                duration: 3,
                overwrite: true,
                ease: 'power3.inOut'
            });

            gsap.to(model.position, {
                scrollTrigger: {
                    markers: true,
                    trigger: heroTrig,
                    scrub: true,
                    start: 'top top',
                    endTrigger: photoTrig,
                    end: 'center top'
                },
                x: 0, y: 3, z: 1.6,
                overwrite: true,
                ease: 'power1.inOut',
            });

            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);

        });

        return () => {
            console.log('Cleaning up GSAP context.');
            ctx.revert();
        }

    }, {
        // ✅ THE FINAL FIX: Add modelGroupRef.current to the array.
        dependencies: [triggerEl, isLoaded, nodes, triggerEl?.children.length, modelGroupRef.current]
    });


    return (
        <Canvas
            shadows
            // frameloop='demand'
            dpr={[0.6, 0.8]}
            camera={{ fov: 55, position: [0, 8, 0] }}
            style={{
                backgroundColor: 'transparent',
                position: 'fixed',
                width: '100dvw',
                height: '100vh',
                zIndex: 2,
                pointerEvents: 'none'
            }}
            gl={{
                antialias: false,
                powerPreference: 'high-performance',
            }}>

            <Suspense fallback={null}>
                <Environment
                    files='/images/hdri/sunrise.jpg'
                    environmentIntensity={0.1} />
                <pointLight
                    castShadow
                    color='white'
                    position={[-4, 1, -6]}
                    intensity={Math.PI * 1} />
                <spotLight
                    castShadow
                    position={[8, 6, -2]}
                    target={targetRef.current}
                    color='orange'
                    intensity={Math.PI * 700} />
                <Bvh>
                    <group
                        ref={modelGroupRef}
                        rotation={initRot}>
                        <group
                            ref={rotationGroupRef}
                            rotation={initRot}>
                            <mesh
                                geometry={nodes.mesh001.geometry}
                                material={materials.LEAVES}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.mesh001_1.geometry}
                                material={materials.RED}
                                ref={targetRef}
                            />
                            <mesh
                                geometry={nodes.mesh001_2.geometry}
                                material={materials.STEM}
                            />
                        </group>
                    </group>
                </Bvh>
                {/* <EffectComposer>
                    <Bloom mipmapBlur intensity={1} luminanceThreshold={0.1} />
                    <N8AO aoRadius={2} intensity={1} screenSpaceRadius />
                </EffectComposer> */}
                <RotatorUseFrame refGroup={rotationGroupRef} />
            </Suspense>
        </Canvas>
    )
}