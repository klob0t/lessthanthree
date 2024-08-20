import React, { useRef, useEffect } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'

export default function Model() {
  const { nodes, materials } = useGLTF("/3ds/rhodanthe.glb");
  const { viewport } = useThree();
  const flower = useRef(null);
  const group = useRef(null);
  useGLTF.preload("/3ds/rhodanthe.glb")


  useEffect(() => {
    gsap.to(flower.current.rotation, {
      y: 10,
      repeat: 0,
      duration: 4,
      ease: "power4.out",
    });
  }, [flower]);

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
      <group ref={flower} scale={viewport.height / 50} position={[0, 0, 0]} rotation={[0, 0, 0]}>
       <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_1.geometry}
          material={materials.Pollen}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_2.geometry}
          material={materials.Petal}
        />
      </group>
    </group>
  )
}
