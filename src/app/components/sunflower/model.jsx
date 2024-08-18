import React, { useRef, useEffect } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'

export default function Model() {
  const { nodes, materials } = useGLTF("/3ds/sunflower.glb");
  const { viewport } = useThree();
  const sunflower = useRef(null);
  const group = useRef(null);


  useEffect(() => {
    gsap.to(sunflower.current.rotation, {
      y: 10,
      repeat: 0,
      duration: 4,
      ease: "power4.out",
    });
  }, [sunflower]);

    useEffect(() => {
    gsap.to(group.current.rotation, {
      y: Math.PI * 2,
      duration: 7,
      repeat: -1,
      ease: "linear",
    });
  }, [group]);

  return (
    <group ref={group}>
      <group ref={sunflower} scale={viewport.height / 5} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001.geometry}
          material={materials['Material.002']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_1.geometry}
          material={materials['Material.003']}
        />
      </group>
    </group>
  )
}
