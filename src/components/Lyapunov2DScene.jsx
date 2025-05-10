import React from 'react';
import { Canvas } from '@react-three/fiber';
import Lyapunov2D from './Lyapunov2D';
import { OrbitControls } from '@react-three/drei'

export default function Lyapunov2DScene() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh', // ocupa toda la altura de la ventana
        backgroundColor: '#222', // opcional, para contrastar
      }}
    >
      <div
        style={{
          width: '80vmin', // mantiene tamaño cuadrado relativo a la ventana
          aspectRatio: '1 / 1',
          border: '4px solid black',
          boxSizing: 'border-box',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#111111']} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Lyapunov2D client:visible />
        </Canvas>
      </div>
    </div>
  );
}
