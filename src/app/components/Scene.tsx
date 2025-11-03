// src/app/components/Scene.tsx
'use client'
import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bvh, Environment, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
import { useStartFlowStore } from '@/app/lib/store/buttonStore'
import { useTriggerStore } from '@/app/lib/store/triggerStore'
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing'

gsap.registerPlugin(ScrollTrigger)

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

/**
 * Single source-of-truth stops. Tweak here.
 * Must be monotonic, start at 0 and end at 1.
 */
const STOPS = [0, 0.35, 0.7, 0.83] as const
const SCENE_LOADER_ID = 'Scene Assets' as const

/* ---------- helper: find segment & localT using STOPS ---------- */
function findSegmentAndLocalT(t: number, stops: readonly number[]) {
    const EPS = 1e-6
    const clamped = THREE.MathUtils.clamp(t, stops[0], stops[stops.length - 1])

    // If t is at or very close to final stop â€” return last segment, localT = 1
    if (clamped >= stops[stops.length - 1] - EPS) {
        const lastIndex = stops.length - 2
        return { index: lastIndex, localT: 1 }
    }

    // Walk segments
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]
        const b = stops[i + 1]

        // If clamped is within (a, b) (with EPS margin), compute localT
        if (clamped > a + EPS && clamped < b - EPS) {
            const localT = (clamped - a) / (b - a)
            return { index: i, localT }
        }

        // If clamped is very close to the left boundary 'a'
        if (Math.abs(clamped - a) <= EPS) {
            if (i === 0) return { index: 0, localT: 0 } // first stop -> start of first segment
            return { index: i - 1, localT: 1 } // otherwise treat as end of previous segment
        }

        // If clamped is very close to the right boundary 'b', treat as end of this segment
        if (Math.abs(clamped - b) <= EPS) {
            return { index: i, localT: 1 }
        }
    }

    // Fallback (shouldn't happen): last segment end
    const lastIndex = stops.length - 2
    return { index: lastIndex, localT: 1 }
}

/* ---------- PositionFollower: lerp between discrete world positions using STOPS ---------- */
function PositionFollower({
    modelRef,
    positionsRef,
    targetT,
    stops = STOPS,
    smooth = true,
    smoothSpeed = 15
}: {
    modelRef: React.RefObject<THREE.Group | null>
    positionsRef: React.RefObject<THREE.Vector3[] | null>
    targetT: React.MutableRefObject<number>
    stops?: readonly number[]
    smooth?: boolean
    smoothSpeed?: number
}) {
    const currentT = useRef(0)
    const tmpPosA = useRef(new THREE.Vector3())
    const tmpPosB = useRef(new THREE.Vector3())
    const outPos = useRef(new THREE.Vector3())

    useFrame((_, delta) => {
        const model = modelRef.current
        const posArr = positionsRef.current
        if (!model || !posArr || posArr.length < 2) return

        if (smooth) {
            currentT.current += (targetT.current - currentT.current) * Math.min(1, delta * smoothSpeed)
        } else {
            currentT.current = targetT.current
        }

        const t = THREE.MathUtils.clamp(currentT.current, 0, 1)
        const { index, localT } = findSegmentAndLocalT(t, stops)

        // clamp index safe
        const i = Math.max(0, Math.min(index, posArr.length - 2))

        tmpPosA.current.copy(posArr[i])
        tmpPosB.current.copy(posArr[i + 1])

        outPos.current.lerpVectors(tmpPosA.current, tmpPosB.current, localT)
        model.position.copy(outPos.current)
    })

    return null
}

/* ---------- RotationFollower (uses STOPS) ---------- */
function RotationFollower({
    modelRef,
    targetT,
    stops = STOPS,
    smooth = true,
    smoothSpeed = 15
}: {
    modelRef: React.RefObject<THREE.Group | null>
    targetT: React.MutableRefObject<number>
    stops?: readonly number[]
    smooth?: boolean
    smoothSpeed?: number
}) {
    const rot0 = useRef(new THREE.Euler(-60 * (Math.PI / 180), 0, -45 * (Math.PI / 180))).current
    const rot1 = useRef(new THREE.Euler(-21 * (Math.PI / 180), 0, 0)).current
    const rot2 = useRef(new THREE.Euler(-20 * (Math.PI / 180), 0, -90 * (Math.PI / 180))).current
    const rot3 = useRef(new THREE.Euler(-100 * (Math.PI / 180), 0, 0)).current

    const q0 = useRef(new THREE.Quaternion().setFromEuler(rot0)).current
    const q1 = useRef(new THREE.Quaternion().setFromEuler(rot1)).current
    const q2 = useRef(new THREE.Quaternion().setFromEuler(rot2)).current
    const q3 = useRef(new THREE.Quaternion().setFromEuler(rot3)).current

    const keyQs = [q0, q1, q2, q3]

    const targetQ = useRef(new THREE.Quaternion())
    const currentQ = useRef(new THREE.Quaternion())

    useFrame((_, delta) => {
        const model = modelRef.current
        if (!model) return

        const t = THREE.MathUtils.clamp(targetT.current, 0, 1)
        const { index, localT } = findSegmentAndLocalT(t, stops)

        targetQ.current.copy(keyQs[index]).slerp(keyQs[index + 1], localT)

        if (!currentQ.current.equals(model.quaternion)) currentQ.current.copy(model.quaternion)

        if (smooth) {
            const alpha = Math.min(1, delta * smoothSpeed)
            currentQ.
                current.slerp(targetQ.current, alpha)
            model.quaternion.copy(currentQ.current)
        } else {
            model.quaternion.copy(targetQ.current)
        }
    })

    return null
}

/* ---------- Auto-rotator (inner Y) ---------- */
export function RotatorUseFrame({ refGroup }: { refGroup: React.RefObject<THREE.Group | null> }) {
    useFrame((_, delta) => {
        const g = refGroup.current
        if (!g) return
        g.rotation.y += delta * (Math.PI * 0.2)
    })
    return null
}



/* ---------- Main Scene ---------- */
export default function Scene() {
    const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult
    const { active } = useProgress()

    const modelGroupRef = useRef<THREE.Group | null>(null)
    const rotationGroupRef = useRef<THREE.Group | null>(null)
    const targetRef = useRef<THREE.Object3D | null>(null)
    const spotLightRef = useRef<THREE.SpotLight | null>(null)
    const proxyRef = useRef({ t: 0 }) // exposed so debug overlay can read it
    const sceneLoaderRef = useRef(false)

    // const viewport = useThree((state) => state.viewport)
    const scalingFactor = Math.min(Math.max(window.innerWidth / 1280, 0.7), 1)

    const isMobile = window.innerWidth < 768

    const [modelReady, setModelReady] = useState(false)

    const triggerEl = useTriggerStore((s) => s.triggerEl)
    const isLoaded = useLoadingStore(state => state.activeLoaders.size === 0)
    const enterSignal = useStartFlowStore((s) => s.enterSignal)


    const startLoading = useLoadingStore((state) => state.startLoading)
    const finishLoading = useLoadingStore((state) => state.finishLoading)
    const shouldHoldScene = active || !modelReady

    const setModelRef = useCallback((el: THREE.Group | null) => {
        modelGroupRef.current = el
        setModelReady(Boolean(el))
    }, [])

    const setTargetRef = useCallback((el: THREE.Object3D | null) => {
        targetRef.current = el
        if (el && spotLightRef.current) {
            spotLightRef.current.target = el
            spotLightRef.current.target.updateMatrixWorld()
        }
    }, [])

    const setSpotLightRef = useCallback((el: THREE.SpotLight | null) => {
        spotLightRef.current = el
        if (el && targetRef.current) {
            el.target = targetRef.current
            el.target.updateMatrixWorld()
        }
    }, [])

    useEffect(() => {
        if (shouldHoldScene && !sceneLoaderRef.current) {
            sceneLoaderRef.current = true
            startLoading(SCENE_LOADER_ID)
        } else if (!shouldHoldScene && sceneLoaderRef.current) {
            sceneLoaderRef.current = false
            finishLoading(SCENE_LOADER_ID)
        }
    }, [shouldHoldScene, startLoading, finishLoading])

    useEffect(() => {
        return () => {
            if (sceneLoaderRef.current) {
                sceneLoaderRef.current = false
                finishLoading(SCENE_LOADER_ID)
            }
        }
    }, [finishLoading])

    useEffect(() => {
        if (!modelReady) return
        const t = window.setTimeout(() => ScrollTrigger.refresh(), 120)
        return () => clearTimeout(t)
    }, [modelReady])

    // positions and scalar target (4 positions must match STOPS length)
    const positionsRef = useRef<THREE.Vector3[] | null>(null)
    const targetT = useRef(0)

    useEffect(() => {
        // define exact world positions for each stop (4 positions -> works with STOPS length 4)
        positionsRef.current = [
            isMobile ? new THREE.Vector3(-0.1, 6, 0.1) : new THREE.Vector3(0.1, 6, 0),   // stop 0
            new THREE.Vector3(0, 0, 3),   // stop 1
            new THREE.Vector3(1, -2, 4), // stop 2
            new THREE.Vector3(0, 1, 2)  // stop 3
        ]
    }, [isMobile])

    useGSAP(() => {
        if (!triggerEl || !isLoaded || !nodes || !modelGroupRef.current || !rotationGroupRef.current || !positionsRef.current || !modelReady)  return
        if (enterSignal === 0) return
        

        const children = Array.from(triggerEl.children) as HTMLElement[]
        const heroTrig = children[0] ?? null
        const photoTrig = children[1] ?? null
        const letterTrig = children[2] ?? null

        if (!heroTrig || !photoTrig || !letterTrig) {
            console.warn('Expected some triggers missing â€” proceeding with scrub over the triggerEl element.')
        }

        // typed array of created ScrollTrigger instances
        const created: Array<ReturnType<typeof ScrollTrigger.create>> = []

        const ctx = gsap.context(() => {
            // initial placement (use first position)
            gsap.set(modelGroupRef.current!.rotation, { x: 0, y: 0, z: 0 })
            const p0 = positionsRef.current![0]
            gsap.set(modelGroupRef.current!.position, { x: p0.x, y: p0.y, z: p0.z })
            gsap.to(modelGroupRef.current!.scale, {
                x: 3 * scalingFactor,
                y: 4 * scalingFactor,
                z: 3 * scalingFactor,
                duration: 4,
                overwrite: true
            })

            // ensure proxy starts at initial stop
            proxyRef.current.t = STOPS[0]
            targetT.current = proxyRef.current.t

            // Create a scrubbed tween that maps scroll to proxyRef.t (0 -> 1)
            const scrubTween = gsap.to(proxyRef.current, {
                t: 1,
                ease: 'none',
                paused: false,
                onUpdate: () => {
                    targetT.current = proxyRef.current.t
                },
                scrollTrigger: {
                    trigger: triggerEl,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                }
            })

            // Pull the ScrollTrigger off the tween without using `any`
            const maybeSt = (scrubTween as unknown as { scrollTrigger?: ReturnType<typeof ScrollTrigger.create> }).scrollTrigger
            if (maybeSt) created.push(maybeSt)
        }, modelGroupRef)

            // store created array on the ctx's scope? not necessary â€” we'll close over `created`
            ; (ctx as unknown as { _created?: Array<ReturnType<typeof ScrollTrigger.create>> })._created = created

        return () => {
            try {
                // try to get the list either from ctx (if present) or fallback to our `created` variable
                const triggers: Array<ReturnType<typeof ScrollTrigger.create>> = (ctx as unknown as { _created?: Array<ReturnType<typeof ScrollTrigger.create>> })._created || created
                triggers.forEach(t => {
                    try { t.kill() } catch (e) { console.error(e) }
                })
            } catch (e) { console.error(e) }
            ctx.revert()
        }
    }, {
        dependencies: [triggerEl, isLoaded, nodes, triggerEl?.children.length, modelReady, enterSignal]
    })



    return (
        <>
            <Canvas
                shadows
                dpr={[0.6, 0.8]}
                camera={{ fov: 55, position: [0, 8, 0] }}
                style={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
            >
                <Suspense fallback={null}>
                    <Environment files='/images/hdri/sunrise.jpg' environmentIntensity={0.4} />
                    <pointLight castShadow color='orange' position={[-4, 2, -6]} intensity={Math.PI * 200} />
                    <spotLight ref={setSpotLightRef} castShadow position={[10, 9, -1]} color='white' intensity={Math.PI * 700} />

                    <Bvh>
                        <group ref={setModelRef}
                            scale={[0, 0, 0]}>
                            {/* <axesHelper /> */}
                            <group ref={rotationGroupRef}>
                                <mesh geometry={nodes.mesh001.geometry} material={materials.LEAVES} />
                                <mesh castShadow receiveShadow geometry={nodes.mesh001_1.geometry} material={materials.RED} ref={setTargetRef} />
                                <mesh geometry={nodes.mesh001_2.geometry} material={materials.STEM} />
                            </group>
                        </group>
                    </Bvh>

                    <RotatorUseFrame refGroup={rotationGroupRef} />

                    {/* PositionFollower replaces PathFollower */}
                    <PositionFollower modelRef={modelGroupRef} positionsRef={positionsRef} targetT={targetT} smooth={true} />

                    <RotationFollower modelRef={modelGroupRef} targetT={targetT} stops={STOPS} smooth={true} />

                    {/* Removed path debug line (no longer needed) */}

                    <EffectComposer>
                        <N8AO />
                        <Bloom
                            intensity={2}
                            luminanceThreshold={0.3}

                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </>
    )
}

useGLTF.preload('/3d/flower.glb')







