'use client'

import { OrbitControls, useGLTF, useTexture } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { N8AO } from "@react-three/postprocessing"
import { useEffect, useRef } from "react"
import * as THREE from 'three'

function Flower() {
   const gltf = useGLTF('/3d/flower2.glb')
   const { nodes } = gltf; // You can still destructure nodes for convenience
   // const groupRef = useRef();

   // 3. Use useEffect to log the data after the component mounts
   useEffect(() => {
      // Log the entire loaded object to see its structure
      console.log('Full loaded GLTF object:', gltf);

      // To specifically check for UV maps on a mesh, inspect its geometry attributes.
      // Let's check the 'Sphere' mesh (the bud) as an example.
      if (nodes.Sphere && nodes.Sphere.geometry) {
         console.log("Attributes for 'Sphere' geometry:", nodes.Sphere.geometry.attributes);
      }

      // You can check other meshes as well
      if (nodes.Sphere_2 && nodes.Sphere_2.geometry) {
         console.log("Attributes for 'Sphere_2' (Leaves) geometry:", nodes.Sphere_2.geometry.attributes);
      }

   }, [gltf, nodes])
   const groupRef = useRef();

   // Corrected the paths to '/3d/textures/' and removed the inner petal texture.
   const [
      ambientOcclusion,
      greenBudDiff,
      greenPetalDiff,
      leafAlpha,
      leafDiff,
      redPetalDiff,
      rosePetalNormal,
      stemDiff,
   ] = useTexture([
      '/3d/textures/Ambient Occlusion Map.png',
      '/3d/textures/Green Bud Diff.png',
      '/3d/textures/Green Petal Diff.png',
      '/3d/textures/Leaf Alpha.png',
      '/3d/textures/Leaf Diff.png',
      '/3d/textures/Red Petal Diff.png',
      '/3d/textures/Rose Petal Normal.png',
      '/3d/textures/Stem Diff.png',
   ]);

     useEffect(() => {
        if (ambientOcclusion) {
            // Tell this specific texture to use the second UV channel (uv1).
            ambientOcclusion.channel = 1;
            // The GLTF loader creates uv, uv1, etc.
            // Channel 0 = uv
            // Channel 1 = uv1
        }
    }, [ambientOcclusion])

   // Set the color space for diffuse textures for correct rendering.
   redPetalDiff.colorSpace = THREE.SRGBColorSpace;
   greenBudDiff.colorSpace = THREE.SRGBColorSpace;
   greenPetalDiff.colorSpace = THREE.SRGBColorSpace;
   leafDiff.colorSpace = THREE.SRGBColorSpace;
   stemDiff.colorSpace = THREE.SRGBColorSpace;


   // Optional: Add a simple rotation animation
   useFrame((state, delta) => {
      if (groupRef.current) {
         groupRef.current.rotation.y += delta * 0.2;
      }
   });

   return (
      <group ref={groupRef} dispose={null}>
         <mesh castShadow receiveShadow geometry={nodes.Sphere.geometry}>
            {/* The `aoMap` will automatically use the second UV channel (uv2) 
                  if it's present on the model's geometry.
                */}
            <meshStandardMaterial map={greenBudDiff}
               aoMap={ambientOcclusion}
            />
         </mesh>

         <mesh castShadow receiveShadow geometry={nodes.Sphere_1.geometry}>
            <meshStandardMaterial
               map={redPetalDiff}
               normalMap={rosePetalNormal}
            aoMap={ambientOcclusion} // Also uses uv2 channel here
            />
         </mesh>

         <mesh castShadow receiveShadow geometry={nodes.Sphere_2.geometry}>
            <meshStandardMaterial
               map={leafDiff}
               alphaMap={leafAlpha}
               transparent={true}
               aoMap={ambientOcclusion} // Also uses uv2 channel here
               side={THREE.DoubleSide}
            />
         </mesh>

         <mesh castShadow receiveShadow geometry={nodes.Sphere_3.geometry}>
            <meshStandardMaterial map={stemDiff} aoMap={ambientOcclusion} />
         </mesh>

         <mesh castShadow receiveShadow geometry={nodes.Sphere_4.geometry}>
            {/* Since there is no 'Petal Inner' texture, we can apply a simple
                  color or reuse another material. Here's a solid color.
                */}
            <meshStandardMaterial
               map={greenPetalDiff}
                aoMap={ambientOcclusion} />
         </mesh>
      </group>
   )
}

// Main component with Canvas and lighting setup
export default function Model() {
   return (
      <Canvas
         shadows
         dpr={[0.6, 0.8]}
         camera={{ fov: 55, position: [0, 8, 0] }}
         style={{ background: 'transparent' }}
      >
         <ambientLight intensity={0.5} />
         <directionalLight
            position={[5, 10, 7.5]}
            intensity={1.5}
         />
         <Flower />
         <OrbitControls />
      </Canvas>
   )
}

// Preloading assets
useGLTF.preload('/3d/flower2.glb');