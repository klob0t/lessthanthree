import React, { useRef, useEffect } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'

export default function Model(){
  const { nodes, materials } = useGLTF("/3ds/sunflower.glb");
  const { viewport } = useThree();
  const sunflower = useRef(null);

  useFrame(() => {
    if (sunflower.current) {
      sunflower.current.rotation.y += 0.01;
    }
  });

   return (
      <group>
      <group ref={sunflower} scale={viewport.height / 5} position={[0, 0, 0]} rotation={[2.7, 0, 0.01]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh551.geometry}
          material={materials.Material}
        />
        <mesh
          position={[0, -0.01, 0]}
          rotation={[0.1, 0, 0]}
          castShadow
          receiveShadow
          geometry={nodes.Mesh551_1.geometry}
          material={materials['Material.001']}
        />
      </group>
      </group>
   )
}