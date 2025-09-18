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
 * Tweakable: single source of truth for where the 4 keyframes live on [0..1].
 * Must be monotonically increasing, start with 0 and end with 1.
 * Example: [0, 0.65, 0.8, 1]
 */
const STOPS = [0, 0.65, 0.8, 1] as const

/* ---------- utility: map t -> (index, localT) using custom stops ---------- */
function findSegmentAndLocalT(t: number, stops: readonly number[]) {
  const clamped = THREE.MathUtils.clamp(t, stops[0], stops[stops.length - 1])
  // if exactly last stop, return last segment & localT=1 (or we set index to last-1 and localT=1)
  if (clamped === stops[stops.length - 1]) {
    const lastIndex = stops.length - 2
    return { index: lastIndex, localT: 1 }
  }
  // find i so stops[i] <= clamped < stops[i+1]
  let index = 0
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i] && clamped < stops[i + 1]) {
      index = i
      break
    }
  }
  const a = stops[index]
  const b = stops[index + 1]
  const localT = (clamped - a) / Math.max(1e-9, (b - a))
  return { index, localT }
}

/* ---------- PathFollower (unchanged behavior) ---------- */
function PathFollower({
  modelRef,
  pathRef,
  targetT,
  smooth = true,
  smoothSpeed = 8,
  orient = true,
  orientBlend = 0.18
}: {
  modelRef: React.RefObject<THREE.Group | null>
  pathRef: React.RefObject<THREE.CatmullRomCurve3 | null>
  targetT: React.MutableRefObject<number>
  smooth?: boolean
  smoothSpeed?: number
  orient?: boolean
  orientBlend?: number
}) {
  const currentT = useRef(0)
  const tmpVec = useRef(new THREE.Vector3())
  const tmpTan = useRef(new THREE.Vector3())
  const orientHelper = useRef(new THREE.Object3D())

  useFrame((_, delta) => {
    const model = modelRef.current
    const path = pathRef.current
    if (!model || !path) return

    if (smooth) {
      const followSpeed = smoothSpeed
      currentT.current += (targetT.current - currentT.current) * Math.min(1, delta * followSpeed)
    } else {
      currentT.current = targetT.current
    }

    const t = THREE.MathUtils.clamp(currentT.current, 0, 1)
    const p = path.getPointAt(t)
    model.position.set(p.x, p.y, p.z)

    if (orient) {
      path.getTangentAt(t, tmpTan.current).normalize()
      const lookTarget = tmpVec.current.copy(p).add(tmpTan.current)
      orientHelper.current.position.copy(p)
      orientHelper.current.lookAt(lookTarget)
      model.quaternion.slerp(orientHelper.current.quaternion, orientBlend)
    }
  })

  return null
}

/* ---------- RotationFollower (uses STOPS) ---------- */
function RotationFollower({
  modelRef,
  targetT,
  smooth = true,
  smoothSpeed = 5
}: {
  modelRef: React.RefObject<THREE.Group | null>
  targetT: React.MutableRefObject<number>
  smooth?: boolean
  smoothSpeed?: number
}) {
  // Four Euler key rotations (tied to STOPS[0..3]). Tweak here if wanted.
  const rot0 = useRef(new THREE.Euler(-60 * (Math.PI / 180), 0, -45 * (Math.PI / 180))).current
  const rot1 = useRef(new THREE.Euler(-1 * (Math.PI / 180), 0, -20 * (Math.PI / 180))).current
  const rot2 = useRef(new THREE.Euler(5 * (Math.PI / 180), 0, 8 * (Math.PI / 180))).current
  const rot3 = useRef(new THREE.Euler(40 * (Math.PI / 180), 0, -12 * (Math.PI / 180))).current

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
    // Find which custom segment t sits in and the normalized localT inside it
    const { index, localT } = findSegmentAndLocalT(t, STOPS)

    // slerp between keyQs[index] and keyQs[index+1]
    targetQ.current.copy(keyQs[index]).slerp(keyQs[index + 1], localT)

    // ensure currentQ reflects actual model quaternion
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

/* ---------- Auto-rotator (inner group) ---------- */
export function RotatorUseFrame({ refGroup }: { refGroup: React.RefObject<THREE.Group | null> }) {
  useFrame((_, delta) => {
    const g = refGroup.current
    if (!g) return
    g.rotation.y += delta * (Math.PI * 0.2)
  })
  return null
}

/* ---------- Scene (main) ---------- */
export default function Scene() {
  const { nodes, materials } = useGLTF('/3d/flower.glb') as unknown as GLTFResult

  const modelGroupRef = useRef<THREE.Group | null>(null)
  const rotationGroupRef = useRef<THREE.Group | null>(null)
  const targetRef = useRef<THREE.Object3D | null>(null)
  const spotLightRef = useRef<THREE.SpotLight | null>(null)

  const [modelReady, setModelReady] = useState(false)

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

  // path and scalar target
  const pathRef = useRef<THREE.CatmullRomCurve3 | null>(null)
  const targetT = useRef(0)

  // Create 4 path points (position keyframes). These correspond to STOPS keys.
  useEffect(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 6, 0),    // key 0
      new THREE.Vector3(0, 2, 1.9),    // key 1
      new THREE.Vector3(1.0, 2, 1.6),  // key 2
      new THREE.Vector3(2.0, 3, 1.6)   // key 3
    ], false, 'catmullrom', 0.3)
    pathRef.current = path
  }, [])

  /* ---------- GSAP: single scrubbed timeline built from STOPS ---------- */
  useGSAP(() => {
    if (!triggerEl || !isLoaded || !nodes || !modelGroupRef.current || !rotationGroupRef.current || !pathRef.current || !modelReady) {
      return
    }

    const children = Array.from(triggerEl.children) as HTMLElement[]
    const heroTrig = children[0] ?? null
    const photoTrig = children[1] ?? null
    const letterTrig = children[3] ?? null
    const endTrig = children[5] ?? null

    if (!heroTrig || !photoTrig || !letterTrig) {
      console.warn('Missing expected triggers (hero/photo/letter). Aborting GSAP setup.')
      return
    }

    const proxy = { t: 0 }
    const ctx = gsap.context(() => {
      // initial placement
      gsap.set(modelGroupRef.current!.rotation, { x: 0, y: 0, z: 0 })
      const p0 = pathRef.current!.getPointAt(0)
      gsap.set(modelGroupRef.current!.position, { x: p0.x, y: p0.y, z: p0.z })
      gsap.set(modelGroupRef.current!.scale, { x: 0, y: 0, z: 0 })
      gsap.to(modelGroupRef.current!.scale, { x: 3, y: 4, z: 3, duration: 4 })

      // STOPS are used here:
      const t0 = STOPS[0]
      const t1 = STOPS[1]
      const t2 = STOPS[2]
      const t3 = STOPS[3]

      // compute tween durations as differences between stops; this makes the timeline reach the stops exactly
      const dur1 = Math.max(0, t1 - t0)
      const dur2 = Math.max(0, t2 - t1)
      const dur3 = Math.max(0, t3 - t2)
      const totalDur = dur1 + dur2 + dur3 || 1

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroTrig,
          start: 'top top',
          endTrigger: endTrig || letterTrig,
          end: 'bottom top',
          scrub: true,
          // markers: true // enable when tuning
        }
      })

      // use durations normalized to timeline (since we use absolute fractions, they sum to totalDur)
      // Because GSAP timeline durations are relative, providing the raw dur* values is fine here;
      // the scrub maps scroll -> timeline progress linearly.
      tl.to(proxy, { t: t1, duration: dur1 / totalDur, onUpdate: () => { targetT.current = proxy.t } }, 0)
        .to(proxy, { t: t2, duration: dur2 / totalDur, onUpdate: () => { targetT.current = proxy.t } })
        .to(proxy, { t: t3, duration: dur3 / totalDur, onUpdate: () => { targetT.current = proxy.t } })

      // small refresh
      setTimeout(() => ScrollTrigger.refresh(), 80)
    }, modelGroupRef)

    return () => {
      try { ScrollTrigger.getAll().forEach(s => s.kill()) } catch (e) { /* ignore */ }
      ctx.revert()
    }
  }, {
    dependencies: [triggerEl, isLoaded, nodes, triggerEl?.children.length, modelReady]
  })

  /* ---------- Render ---------- */
  return (
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
            <group ref={rotationGroupRef}>
              <mesh geometry={nodes.mesh001.geometry} material={materials.LEAVES} />
              <mesh castShadow receiveShadow geometry={nodes.mesh001_1.geometry} material={materials.RED} ref={setTargetRef} />
              <mesh geometry={nodes.mesh001_2.geometry} material={materials.STEM} />
            </group>
          </group>
        </Bvh>

        <RotatorUseFrame refGroup={rotationGroupRef} />

        <PathFollower modelRef={modelGroupRef} pathRef={pathRef} targetT={targetT} smooth={true} orient={false} />

        <RotationFollower modelRef={modelGroupRef} targetT={targetT} smooth={true} smoothSpeed={5} />

        {/* debug: draw path */}
        <line>
          <bufferGeometry attach="geometry" onUpdate={(geo: THREE.BufferGeometry) => {
            const path = pathRef.current
            if (!path || !geo) return
            const divisions = 80
            const pts = new Float32Array(divisions * 3)
            for (let i = 0; i < divisions; i++) {
              const p = path.getPointAt(i / (divisions - 1))
              pts[i * 3 + 0] = p.x
              pts[i * 3 + 1] = p.y
              pts[i * 3 + 2] = p.z
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pts, 3))
            geo.computeBoundingSphere()
          }} />
          <lineBasicMaterial attach="material" toneMapped={false} linewidth={1} />
        </line>

        <EffectComposer>
          <N8AO />
          <Bloom />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
