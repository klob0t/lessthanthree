import React, { useRef } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

export default function Model(){
   const { Rose } = useGLTF('/3ds/rose.glb')

   return (
      <group>
          <mesh
          castShadow
          receiveShadow
          geometry={nodes.mesh.geometry}
          material={materials.Material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.mesh_1.geometry}
          material={materials['Material.001']}
        />
      </group>
   )
}