import React from 'react';
import { Canvas } from '@react-three/fiber';
import PlaneWithShader from './PlaneWithShader';
import { OrbitControls } from '@react-three/drei'

export default function MyScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
    > 
       <color attach="background" args={['#20232a']} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <PlaneWithShader/>
      <OrbitControls />
    </Canvas>
  );
}