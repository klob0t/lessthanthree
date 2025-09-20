// src/app/components/Scene.tsx
'use client'
import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bvh, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLoadingStore } from '@/app/lib/store/loadingStore'
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

/* ---------- helper: find segment & localT using STOPS ---------- */
function findSegmentAndLocalT(t: number, stops: readonly number[]) {
    const EPS = 1e-6
    const clamped = THREE.MathUtils.clamp(t, stops[0], stops[stops.length - 1])

    // If t is at or very close to final stop — return last segment, localT = 1
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
            currentQ.current.slerp(targetQ.current, alpha)
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

/* ---------- DebugOverlay (DOM) ---------- */
// function DebugOverlay({
//     proxyRef,
//     stops,
//     showMarkers,
//     setShowMarkers,
//     rebuild
// }: {
//     proxyRef: React.RefObject<{ t: number }>
//     stops: readonly number[]
//     showMarkers: boolean
//     setShowMarkers: (v: boolean) => void
//     rebuild: () => void
// }) {
//     const [vals, setVals] = useState({ t: 0, index: 0, localT: 0 })
//     const rafRef = useRef<number | null>(null)

//     useEffect(() => {
//         let mounted = true
//         function tick() {
//             if (!mounted) return
//             const t = proxyRef.current?.t ?? 0
//             const { index, localT } = findSegmentAndLocalT(t, stops)
//             setVals({ t, index, localT })
//             rafRef.current = requestAnimationFrame(tick)
//         }
//         rafRef.current = requestAnimationFrame(tick)
//         return () => {
//             mounted = false
//             if (rafRef.current) cancelAnimationFrame(rafRef.current)
//         }
//     }, [proxyRef, stops])

//     return (
//         <div style={{
//             position: 'fixed',
//             right: 12,
//             top: 12,
//             zIndex: 9999,
//             background: 'rgba(0,0,0,0.6)',
//             color: 'white',
//             fontFamily: 'monospace',
//             padding: '10px',
//             borderRadius: 8,
//             minWidth: 220,
//             fontSize: 12,
//             pointerEvents: 'auto'
//         }}>
//             <div style={{ marginBottom: 6, fontWeight: 700 }}>Scene Debug</div>
//             <div>t: {vals.t.toFixed(4)}</div>
//             <div>segment: {vals.index} / {stops.length - 2}</div>
//             <div>localT: {vals.localT.toFixed(4)}</div>
//             <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
//             <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
//                 show ScrollTrigger markers
//             </label>
//             <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
//                 <button onClick={rebuild} style={{ flex: 1, padding: '6px 8px' }}>Rebuild timeline</button>
//             </div>
//             <div style={{ marginTop: 8, fontSize: 11, opacity: 0.85 }}>
//                 STOPS: {stops.join(', ')}
//             </div>
//         </div>
//     )
// }

/* ---------- Main Scene ---------- */
export default function Scene() {
    const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult

    const modelGroupRef = useRef<THREE.Group | null>(null)
    const rotationGroupRef = useRef<THREE.Group | null>(null)
    const targetRef = useRef<THREE.Object3D | null>(null)
    const spotLightRef = useRef<THREE.SpotLight | null>(null)
    const proxyRef = useRef({ t: 0 }) // exposed so debug overlay can read it

    const [modelReady, setModelReady] = useState(false)
    // const [showMarkers, setShowMarkers] = useState(false)
    // const [rebuildKey, setRebuildKey] = useState(0) 

    const triggerEl = useTriggerStore((s) => s.triggerEl)
    const isLoaded = useLoadingStore(state => state.activeLoaders.size === 0)

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
            new THREE.Vector3(0.1, 6, 0),   // stop 0
            new THREE.Vector3(0, 0, 3),   // stop 1
            new THREE.Vector3(1, -2, 4), // stop 2
            new THREE.Vector3(0, 1, 2)  // stop 3
        ]
    }, [])

    /* ---------- GSAP: SNAP-per-section (replace the scrubbed useGSAP block) ---------- */
    // useGSAP(() => {
    //     if (!triggerEl || !isLoaded || !nodes || !modelGroupRef.current || !rotationGroupRef.current || !positionsRef.current || !modelReady) {
    //         return
    //     }

    //     const children = Array.from(triggerEl.children) as HTMLElement[]
    //     const heroTrig = children[0] ?? null
    //     const photoTrig = children[1] ?? null
    //     const letterTrig = children[2] ?? null
    //     const endTrig = children[4] ?? null

    //     console.log(children, heroTrig, photoTrig, letterTrig, endTrig)

    //     if (!heroTrig || !photoTrig || !letterTrig) {
    //         console.warn('Missing expected triggers (hero/photo/letter). Aborting GSAP setup.')
    //         return
    //     }

    //     const created: ScrollTrigger[] = []

    //     const ctx = gsap.context(() => {
    //         // initial placement (use first position)
    //         gsap.set(modelGroupRef.current!.rotation, { x: 0, y: 0, z: 0 })
    //         const p0 = positionsRef.current![0]
    //         gsap.set(modelGroupRef.current!.position, { x: p0.x, y: p0.y, z: p0.z })
    //         gsap.set(modelGroupRef.current!.scale, { x: 0, y: 0, z: 0 })
    //         gsap.to(modelGroupRef.current!.scale, { x: 3, y: 4, z: 3, duration: 4 })

    //         // ensure proxy starts at initial stop
    //         proxyRef.current.t = STOPS[0]
    //         targetT.current = proxyRef.current.t

    //         // helper to animate proxy -> stop
    //         const snapDuration = 0.25// smaller -> less chance of overlap; 0 for instant
    //         const snapTo = (stop: number) => {
    //             // kill any previous snaps on proxy object
    //             gsap.killTweensOf(proxyRef.current)

    //             // if already very near target, jump (avoid tiny micro-tweens)
    //             if (Math.abs(proxyRef.current.t - stop) < 1e-3) {
    //                 proxyRef.current.t = stop
    //                 targetT.current = proxyRef.current.t
    //                 return
    //             }

    //             gsap.to(proxyRef.current, {
    //                 t: stop,
    //                 duration: snapDuration,
    //                 overwrite: true,
    //                 ease: 'power2.out',
    //                 onUpdate: () => {
    //                     targetT.current = proxyRef.current.t
    //                 }
    //             })
    //         }

    //         // map sections to stop indices (adjust indices to your DOM order)
    //         const mapping = [
    //             { el: heroTrig, stopIndex: 0 },
    //             { el: photoTrig, stopIndex: 1 },
    //             { el: letterTrig, stopIndex: 2 },
    //             // optional final area mapping to last stop
    //             ...(endTrig ? [{ el: endTrig, stopIndex: STOPS.length - 1 }] : [])
    //         ] as const

    //         // create a ScrollTrigger for each mapped element
    //         for (const item of mapping) {
    //             const st = ScrollTrigger.create({
    //                 trigger: item.el,
    //                 start: 'top top',
    //                 end: 'bottom top',
    //                 markers: showMarkers, // reuse debug toggle
    //                 onEnter: () => {
    //                     snapTo(STOPS[item.stopIndex])
    //                 },
    //                 onEnterBack: () => {
    //                     snapTo(STOPS[item.stopIndex])
    //                 }
    //             })
    //             created.push(st)
    //         }

    //         // small refresh
    //         setTimeout(() => ScrollTrigger.refresh(), 80)
    //     }, modelGroupRef)

    //         ; (ctx as any)._created = created

    //     return () => {
    //         try {
    //             const triggers: ScrollTrigger[] = (ctx as any)._created || []
    //             triggers.forEach(t => t.kill())
    //         } catch (e) { /* ignore */ }
    //         ctx.revert()
    //     }
    // }, {
    //     dependencies: [triggerEl, isLoaded, nodes, triggerEl?.children.length, modelReady, showMarkers, rebuildKey]
    // })

    // render

    /* ---------- Replace your existing useGSAP block with this (no `any`) ---------- */
    useGSAP(() => {
        if (!triggerEl || !isLoaded || !nodes || !modelGroupRef.current || !rotationGroupRef.current || !positionsRef.current || !modelReady) {
            return
        }

        const children = Array.from(triggerEl.children) as HTMLElement[]
        const heroTrig = children[0] ?? null
        const photoTrig = children[1] ?? null
        const letterTrig = children[2] ?? null

        if (!heroTrig || !photoTrig || !letterTrig) {
            console.warn('Expected some triggers missing — proceeding with scrub over the triggerEl element.')
        }

        // typed array of created ScrollTrigger instances
        const created: Array<ReturnType<typeof ScrollTrigger.create>> = []

        const ctx = gsap.context(() => {
            // initial placement (use first position)
            gsap.set(modelGroupRef.current!.rotation, { x: 0, y: 0, z: 0 })
            const p0 = positionsRef.current![0]
            gsap.set(modelGroupRef.current!.position, { x: p0.x, y: p0.y, z: p0.z })
            gsap.set(modelGroupRef.current!.scale, { x: 0, y: 0, z: 0 })
            gsap.to(modelGroupRef.current!.scale, { x: 3, y: 4, z: 3, duration: 4 })

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

            // store created array on the ctx's scope? not necessary — we'll close over `created`
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
        dependencies: [triggerEl, isLoaded, nodes, triggerEl?.children.length, modelReady]
    })



    return (
        <>
            {/* Debug overlay (DOM) */}
            {/* <DebugOverlay
                proxyRef={proxyRef}
                stops={STOPS}
                showMarkers={showMarkers}
                setShowMarkers={(v) => setShowMarkers(v)}
                rebuild={() => setRebuildKey(k => k + 1)}
            /> */}

            {/* 3D Canvas */}
            <Canvas
                shadows
                dpr={[0.6, 0.8]}
                camera={{ fov: 55, position: [0, 8, 0] }}
                style={{
                    backgroundColor: 'transparent',
                    position: 'fixed',
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
            >
                <Suspense fallback={null}>
                    <Environment files='/images/hdri/sunrise.jpg' environmentIntensity={0.1} />
                    <pointLight castShadow color='white' position={[-4, 1, -6]} intensity={Math.PI * 1} />
                    <spotLight ref={setSpotLightRef} castShadow position={[9, 10, -2]} color='orange' intensity={Math.PI * 700} />

                    <Bvh>
                        <group ref={setModelRef}>
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
                        <Bloom />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </>
    )
}
