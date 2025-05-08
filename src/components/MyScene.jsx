import React from 'react';
import { Canvas } from '@react-three/fiber';
import PlaneWithShader from './PlaneWithShader';
import { OrbitControls } from '@react-three/drei'

export default function MyScene() {
  return (
    <div
      style={{
        width: '100%',        // ocupa todo el ancho de su contenedor
        aspectRatio: '1 / 1', // siempre 1:1
        maxWidth: '600px',     // opcional, para un límite
        margin: '0 auto',      // opcional, para centrar
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#111111']} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <PlaneWithShader client:visible />
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}