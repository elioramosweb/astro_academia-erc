import React from 'react';
import { Canvas } from '@react-three/fiber';
import Lyapunov3D from './Lyapunov3D';
import MarchingCubesFromSlices from './MarchingCubesFromSlices'
import { OrbitControls,Stage,Gltf } from '@react-three/drei'

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
          camera={{ position: [2, 5, 10], fov: 50 }}
          // gl={{ toneMappingExposure: 1.5 }}
          gl={{ antialias: false }} dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#ffffff']} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} castShadow />
          {/* <Stage
            environment="studio" // también puedes usar "warehouse", "sunset", etc.
            intensity={1.0}
            contactShadow={{ opacity: 0.4, blur: 2 }}
            adjustCamera={false} 
            shadows={{ type: 'contact', opacity: 0.4, bias: -0.001 }}
          > */}
        <Stage
          intensity={0.5}
          preset="rembrandt"
          shadows={{ type: 'accumulative', color: 'skyblue', colorBlend: 2, opacity: 1 }}
          adjustCamera={1}
          environment="studio">
      
          <Lyapunov3D client:visible /> 
         
          {/* <MarchingCubesFromSlices
            nSlices={200}
            resolution={128}
            thickness={0.1}
            level={0.6}
          /> */}

          </Stage>
          <OrbitControls/>
        </Canvas>
      </div>
    </div>
  );
}
