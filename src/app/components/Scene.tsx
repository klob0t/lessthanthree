// src/app/components/Scene.tsx

'use client'
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree, } from '@react-three/fiber'
import { Bvh, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BlendFunction, KernelSize, Resolution } from 'postprocessing'
import { Bloom, EffectComposer, Noise, ChromaticAberration, BrightnessContrast, SMAA } from '@react-three/postprocessing'
import { N8AO } from '@react-three/postprocessing'
// import {}

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

export default function Scene({ trigger }: { trigger: React.RefObject<HTMLElement | null> }) {
    const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult
    const modelGroupRef = useRef<THREE.Group>(null)
    const rotationGroupRef = useRef<THREE.Group>(null)
    const targetRef = useRef<THREE.Object3D>(undefined)
    const initPos: [number, number, number] = [0, 7, 0];
    const initRot: [number, number, number] = [Math.PI / 0.5, 0, 0];

    useGSAP(() => {
        if (!trigger || !trigger.current) return;

        let rafId: number | null = null;
        let tl: TimelineWithScroll | null = null;
        let created = false;


        const trySetup = () => {
            if (!trigger || !trigger.current) return;


            const children = Array.from(trigger.current.children) as HTMLElement[]


            const heroTrig = children[0] ?? null
            const photoTrig = children[1] ?? null
            const letterTrig = children[2] ?? null

            if (!nodes || !modelGroupRef.current || !rotationGroupRef.current) {
                rafId = requestAnimationFrame(trySetup);
                return;
            }

            if (created) return;
            created = true;

            const model = modelGroupRef.current!;

            tl = gsap.timeline({
            }) as TimelineWithScroll;


            tl.to(model.position, {

                x: 0,
                y: 3,
                z: 1.6,
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: heroTrig,
                    scrub: true,
                    // markers: true,
                    start: 'top top',
                    endTrigger: photoTrig,
                    end: 'center top'
                },
            }, 0)
            tl.to(model.rotation, {
                x: Math.PI / 0.7,
                y: 0,
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: heroTrig,
                    scrub: true,
                    start: 'top top',
                    endTrigger: photoTrig,
                    end: 'center top',
                }
            }, 0)

            ScrollTrigger.refresh();
        };

        rafId = requestAnimationFrame(trySetup);

        return () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            if (tl) {
                try {
                    const st = tl.scrollTrigger;
                    tl.kill();
                    if (st) st.kill();
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }, { dependencies: [trigger, nodes], scope: trigger })


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
                // toneMapping: THREE.ACESFilmicToneMapping,
                // outputColorSpace: THREE.SRGBColorSpace,
            }}
        >


            <Suspense fallback={null}>
                <Environment
                    files='/images/hdri/sunrise.jpg'
                    environmentIntensity={0.2} />
                {/* <directionalLight intensity={6} /> */}
                <pointLight
                    castShadow
                    color='white'
                    position={[-4, 1, -6]}
                    intensity={Math.PI * 1} />
                <spotLight
                    castShadow
                    position={[8, 4, -2]}
                    target={targetRef.current}
                    color='orange'
                    intensity={Math.PI * 700} />
                <Bvh>
                    <group
                        ref={modelGroupRef}
                        position={initPos}
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
                <EffectComposer>
                    <N8AO
                        quality="low"
                        // screenSpaceRadius // 'low', 'medium', 'high', 'ultra'
                        aoRadius={1} // The radius of the occlusion effect
                        intensity={2} // How strong the effect is
                        aoSamples={1}
                        distanceFalloff={10} // How fast the effect fades with distance
                    />
                    <Bloom
                        luminanceThreshold={0.4}
                        luminanceSmoothing={0}
                        intensity={20} />
                </EffectComposer>
                <RotatorUseFrame refGroup={rotationGroupRef} />
            </Suspense>
        </Canvas>
    )
}