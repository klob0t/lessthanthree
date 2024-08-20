import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Model from './model';
import { Environment } from '@react-three/drei';
import gsap from 'gsap';
import { useEffect, forwardRef } from 'react';

function AnimatedCamera() {
    const { camera } = useThree();

    useEffect(() => {
        // Set the initial position of the camera
        camera.position.set(0, 100, 100);

        // Animate the camera to the new position
        gsap.to(camera.position, {
            x: 0,
            y: 4,
            z: 1, // Adjust this value to move the camera closer
            duration: 2,
            ease: "power2.out"
        });
    }, [camera]);

    useFrame(() => {
        camera.lookAt(0, 0, 0);
    });

    return null;
}

function Scene(props, ref) {
    return (
        <Canvas style={{ background: 'white' }}>
            <AnimatedCamera />
            <pointLight intensity={6} />
            <Environment preset="sunset" />
            <Model />
        </Canvas>
    );
}
export default Scene