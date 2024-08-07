import React, { useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

export default function Model(){
  const { nodes, materials } =  useGLTF("/3ds/rose.glb")
  const { viewport } = useThree()
  const rose = useRef(null)

   useFrame(() => {
    rose.current.rotation.y += 0.02
})
   return (
      <group ref={rose} scale={viewport.width/2} position={[0, -0.5, 0]}>
          <mesh 
          geometry={nodes.mesh.geometry}
          material={new THREE.MeshStandardMaterial()}/>
          <mesh 
          geometry={nodes.mesh_1.geometry}
          material={new THREE.MeshStandardMaterial()}/>
      </group>
   )
}