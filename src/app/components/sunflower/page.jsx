import { Canvas, useThree } from '@react-three/fiber';
import Model from './model';
import { Environment } from '@react-three/drei';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';
import * as THREE from 'three'

export default function Scene() {
  const camera = useRef(null);

  return (
    <Canvas 
      camera={{position: [0, -1, 0], fov: 120}} 
      style={{ background: 'white' }}>
      <hemisphereLight intensity={6} />
      <Environment preset="city" />
      <Model />
    </Canvas>
  );
}