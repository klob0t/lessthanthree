// // src/app/components/Model.tsx

// 'use client'
// import * as THREE from 'three'
// import React from 'react'
// import { useGLTF } from '@react-three/drei'
// import { GLTF } from 'three-stdlib'

// type GLTFResult = GLTF & {
//     nodes: {
//         flower_flower_0?: THREE.Mesh
//         flower_flower_0_1?: THREE.Mesh
//     }
//     materials: {
//         flower?: THREE.MeshStandardMaterial
//         Material?: THREE.MeshStandardMaterial
//     }
// }

// export default function Model() {
//     const path = '/3d/statue.glb'
//     const gltf = useGLTF(path) as unknown as GLTFResult

//     const { nodes, materials } = gltf || {}
//     const hasMeshes = !!(nodes?.flower_flower_0 || nodes?.flower_flower_0_1)

//     if (!hasMeshes) {
//         return (
//             <group>
//                 <mesh>
//                     <boxGeometry args={[1, 1, 1]} />
//                     <meshStandardMaterial />
//                 </mesh>
//             </group>
//         )
//     }

//     return (
//         <group dispose={null}>
//             <group scale={0.012} rotateX={200}>
//                 {nodes?.flower_flower_0 && (
//                     <mesh
//                         castShadow
//                         receiveShadow
//                         geometry={nodes.flower_flower_0.geometry}
//                         material={materials?.flower}
//                     />
//                 )}
//                 {nodes?.flower_flower_0_1 && (
//                     <mesh
//                         castShadow
//                         receiveShadow
//                         geometry={nodes.flower_flower_0_1.geometry}
//                         material={materials?.Material}
//                     />
//                 )}
//             </group>
//         </group>
//     )
// }

// useGLTF.preload('/3d/statue.glb')


// src/app/components/Model.tsx

'use client'
import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
    nodes: {
        Object_2: THREE.Mesh
        Object_3: THREE.Mesh
        Object_4: THREE.Mesh
        Object_5: THREE.Mesh
    }
    materials: {
        CREEPY_LADY_PG_EX2_tex0: THREE.MeshBasicMaterial
        CREEPY_LADY_PG_EX2_tex1: THREE.MeshBasicMaterial
        CREEPY_LADY_PG_EX2_tex2: THREE.MeshBasicMaterial
        CREEPY_LADY_PG_EX2_tex3: THREE.MeshBasicMaterial
    }
}

export default function Model() {
    const path = '/3d/statue.glb'
    const gltf = useGLTF(path) as unknown as GLTFResult

    const { nodes, materials } = gltf || {}

    if (!nodes) {
        return (
            <group>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial />
                </mesh>
            </group>
        )
    }

    return (
        <group dispose={null}>
            <group
                scale={0.17} 
                position={[0.4, 3, -1.5]}
                rotation={[-Math.PI / 2, -1.41, Math.PI / 2]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_2.geometry}
                    material={materials.CREEPY_LADY_PG_EX2_tex0}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_3.geometry}
                    material={materials.CREEPY_LADY_PG_EX2_tex1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_4.geometry}
                    material={materials.CREEPY_LADY_PG_EX2_tex2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_5.geometry}
                    material={materials.CREEPY_LADY_PG_EX2_tex3}
                />
            </group>
        </group>
    )
}

useGLTF.preload('/3d/statue.glb')
