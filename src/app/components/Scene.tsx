// src/app/components/Scene.tsx

'use client'
import React, { Suspense, useRef } from 'react'
import { Canvas, } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type TimelineWithScroll = gsap.core.Timeline & { scrollTrigger?: ScrollTrigger | null }


interface GLTFResult {
    nodes: {
        mesh001: THREE.Mesh
        mesh001_1: THREE.Mesh
        mesh001_2: THREE.Mesh
        mesh001_3: THREE.Mesh
    }
    materials: {
        RED: THREE.MeshStandardMaterial
        YELLOW: THREE.MeshStandardMaterial
        LEAVES: THREE.MeshPhysicalMaterial
        PUTIK: THREE.MeshStandardMaterial
    }
}

export default function Scene({ trigger }: { trigger: React.RefObject<HTMLElement | null> }) {
    const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult
    const modelGroupRef = useRef<THREE.Group>(null)
    const rotationGroupRef = useRef<THREE.Group>(null)
    const initPos: [number, number, number] = [0, 7, 0];
    const initRot: [number, number, number] = [Math.PI / 0.5, 0, 0];

    useGSAP(() => {
        if (!trigger || !trigger.current) return;

        let rafId: number | null = null;
        let tl: TimelineWithScroll | null = null;
        let created = false;

        const el = gsap.utils.toArray(trigger.current.children)


        const heroTrig = el[0]
        const photoTrig = el[1]
        const letterTrig = el[2]

        const trySetup = () => {
            if (!trigger || !trigger.current) return;

            if (!nodes || !modelGroupRef.current || !rotationGroupRef.current) {
                rafId = requestAnimationFrame(trySetup);
                return;
            }

            if (created) return;
            created = true;

            const trigEl = trigger.current!;
            const model = modelGroupRef.current!;
            const rotation = rotationGroupRef.current!;

            tl = gsap.timeline({
            }) as TimelineWithScroll;


            gsap.to(rotation.rotation, {
                y: Math.PI * 2,
                ease: 'none',
                repeat: -1,
                duration: 10
            })  

            tl.to(model.position, {
                y: 4,
                x: 1.5,
                z: 1,
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: el[0],
                    scrub: true,
                    // markers: true,
                    start: '60 top',
                    endTrigger: photoTrig,
                    end: 'center center'
                },
            }, 0)
            tl.to(model.rotation,
                {
                    x: Math.PI / 0.7,
                    y: 0,
                    ease: 'power1.inOut',
                    scrollTrigger: {
                        trigger: el[0],
                        scrub: true,
                        start: '60 top',
                        endTrigger: photoTrig,
                        end: 'center center',
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
                    // ignore
                }
            }
        };
    }, {
        dependencies: [trigger, nodes],
        scope: trigger.current,
    });


    return (
        <Canvas
            shadows
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
                toneMapping: THREE.ACESFilmicToneMapping,
                outputColorSpace: THREE.SRGBColorSpace,
            }}
        >
            <Suspense fallback={null}>
                <Environment files='/images/hdri/sunrise.jpg' />
                <group
                    ref={modelGroupRef}
                    position={initPos}
                    rotation={initRot}>
                    <group
                        ref={rotationGroupRef}
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
            </Suspense>
        </Canvas>
    )
}