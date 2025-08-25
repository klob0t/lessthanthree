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
        Object_0: THREE.Mesh
        Object_0_1: THREE.Mesh
        Object_0_2: THREE.Mesh
        Object_0_3: THREE.Mesh
    }
    materials: {
        CREEPY_LADY_PG_EX2_tex0: THREE.Material
        CREEPY_LADY_PG_EX2_tex1: THREE.Material
        CREEPY_LADY_PG_EX2_tex2: THREE.Material
        CREEPY_LADY_PG_EX2_tex3: THREE.Material
    }
}

export default function Scene({ trigger }: { trigger: React.RefObject<HTMLElement> }) {
    const { nodes, materials } = useGLTF('/3d/statue.glb') as unknown as GLTFResult
    const modelGroupRef = useRef<THREE.Group>(null)
    const rotationGroupRef = useRef<THREE.Group>(null)
    const initPos: [number, number, number] = [0, 0, 0];
    const initRot: [number, number, number] = [-1, 0, 0];

    console.log(modelGroupRef.current)

    useGSAP(() => {
        if (!trigger || !trigger.current) return;

        let rafId: number | null = null;
        let tl: TimelineWithScroll | null = null;
        let created = false;

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
                scrollTrigger: {
                    trigger: trigEl,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                    markers: true,
                },
            }) as TimelineWithScroll;

            tl.to(model.position, { y: -4, x: 1 }, 0);
            tl.to(rotation.rotation, { y: Math.PI * 2, x: 0 }, 0);

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
        scope: modelGroupRef,
    });


    return (
        <Canvas
            shadows
            camera={{ fov: 55, position: [0, 8, 0] }}
            style={{
                backgroundColor: 'transparent',
                position: 'fixed',
                width: '100vw',
                height: '100vh',
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
                    position={initPos}>
                    <group
                        ref={rotationGroupRef}
                        rotation={initRot}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_0.geometry}
                            material={materials.CREEPY_LADY_PG_EX2_tex0}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_0_1.geometry}
                            material={materials.CREEPY_LADY_PG_EX2_tex1}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_0_2.geometry}
                            material={materials.CREEPY_LADY_PG_EX2_tex2}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_0_3.geometry}
                            material={materials.CREEPY_LADY_PG_EX2_tex3}
                        />
                    </group>
                </group>
            </Suspense>
        </Canvas>
    )
}