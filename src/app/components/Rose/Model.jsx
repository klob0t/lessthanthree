import React, { useRef } from 'react'
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
      <group ref={rose} scale={viewport.width/2}>
          <mesh 
          geometry={nodes.mesh.geometry}
          material={materials['Material.001']}/>
          <mesh 
          geometry={nodes.mesh_1.geometry}
          material={materials['Material.002']}/>
      </group>
   )
}