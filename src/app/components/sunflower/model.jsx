import React, { useRef, useEffect } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'

export default function Model(){
 
  const { nodes, materials } = useGLTF("/3ds/sunflower.glb");
  const { viewport } = useThree();
  const sunflower = useRef(null);
  const text = useRef(null);

  useFrame(() => {
    if (sunflower.current) {
      sunflower.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    if (sunflower.current) {
      gsap.to(sunflower.current.scale, {
        x: viewport.height / 4,
        y: viewport.height / 4,
        z: viewport.height / 4,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  }, [sunflower.current]);

   return (
      <group>
      <group ref={sunflower} scale={0} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh551.geometry}
          material={materials.Material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh551_1.geometry}
          material={materials['Material.001']}
        />
      </group>
      </group>
   )
}