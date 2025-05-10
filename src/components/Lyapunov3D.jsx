// // Lyapunov3D.jsx
// import { useRef, useMemo } from 'react';
// import * as THREE from 'three'
// import { useFrame } from '@react-three/fiber';
// import { useControls } from 'leva';
// import { DoubleSide } from 'three';
// import { MeshTransmissionMaterial} from '@react-three/drei'

// const vertexShader = `

//   varying vec3  vPosition;
//   varying vec2  vUv;
//   uniform vec3  uSliceOffset;


//   void main() {
//       vPosition = position - uSliceOffset;

//       // vPosition.x += uDisplaceX;
//       // vPosition.y += uDisplaceY;
//       // vPosition.z += uDisplaceZ;

//       vUv = uv;
//       vec3 newPosition = position;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
//   }
// `;

// const fragmentShader = `
 
//   precision mediump float;

//   uniform float uTime;
//   uniform float uZoom;
//   uniform float uDisplaceX;
//   uniform float uDisplaceY;
//   uniform float uDisplaceZ;
//   uniform float uBlack;
//   uniform float uWhite;


//   varying vec2  vUv;
//   varying vec3  vPosition;

//   #define NMAX 100

//   float lyapunov(vec3 coord) {
//       float x = 0.5;
//       float sum = 0.0;

//       for (int i = 0; i < NMAX; i++) {
//           int pos = int(mod(float(i), 6.0));
//           float r = 0.0;
//           if (pos == 0 || pos == 1) {
//               r = coord.x;
//           } else if (pos ==2 || pos == 3) {
//               r = coord.y;
//           } else {
//               r = coord.z;
//           }
//           x = r * x * (1.0 - x);
//           sum += log(abs(r - 2.0 * r * x));
//       }

//       return sum / float(NMAX);
//   }

//   float func(vec3 coord){
//       return coord.x*coord.x - coord.y*coord.y;
//   }

//   vec3 palette(float t) {
      
//       float r = smoothstep(0.0, 0.5, t); // Rojo empieza temprano y permanece
//       float g = smoothstep(0.25, 0.75, t); // Verde un poco después y se va en 0.7
//       float b = smoothstep(0.5, 1.0, t); // Azul empieza tarde y termina en el final

//       float intensity = mix(0.50, 1.0, t);

//       return vec3(r * intensity, g * intensity, b * intensity);

//     }

//   void main() {

//       vec3 coord = (vPosition + vec3(uDisplaceX,uDisplaceY,uDisplaceZ)) * uZoom;
          
//       float val = smoothstep(-1.0, 1.0,lyapunov(coord));

//         // if (val < 0.2) { // Ajusta el umbral según lo necesites
//         //     //discard;
//         //     val = 0.0;
//         // }

//       vec3 color = palette(val);

//       float dist1 = distance(color,vec3(1.0));
//       float dist2 = distance(color,vec3(0.0));
    
//       if (dist1 < uWhite)
//       {
//           discard;
//       }

//       if (dist2 < uBlack)
//       {
//           discard;
//       }

//       gl_FragColor = vec4(color,1.0);
//   }
// `;


// export default function Lyapunov3D() {
//   // Sliders de Leva
//   const { uZoom, uDisplaceX, uDisplaceY, uDisplaceZ, uWhite, uBlack, nSlices, thickness, gap } = useControls({
//     uZoom:      { value: 1.48, min: 0.1, max: 10, step: 0.001 },
//     uDisplaceX: { value: 0.55, min: -10, max: 20, step: 0.001 },
//     uDisplaceY: { value: 1.90, min: -10, max: 20, step: 0.001 },
//     uDisplaceZ: { value: 1.90, min: -10, max: 20, step: 0.001 },
//     uWhite:     { value: 1.0, min: 0, max: 1, step: 0.001 },
//     uBlack:     { value: 0.2, min: 0, max: 1, step: 0.001 },
//     nSlices:    { value: 200, min: 1, max: 1000, step: 1 },
//     thickness:  { value: 0.02, min: 0.001, max: 0.5, step: 0.001 },
//     gap:        { value: 0.00, min: 0, max: 1, step: 0.001 }
//   });

//   const size = 4;
//   const startZ = -size / 2 + thickness / 2;

//   const geometry = useMemo(
//     () => new THREE.BoxGeometry(size, size, thickness, 64, 64,64),
//     [size, thickness]
//   );

//   const baseMaterial = useMemo(
//     () =>
//       new THREE.ShaderMaterial({
//         vertexShader,
//         fragmentShader,
//         side: DoubleSide,
//         transparent: true,
//         uniforms: {
//           uTime:        { value: 0 },
//           uZoom:        { value: uZoom },
//           uDisplaceX:   { value: uDisplaceX },
//           uDisplaceY:   { value: uDisplaceY },
//           uDisplaceZ:   { value: uDisplaceZ },
//           uWhite:       { value: uWhite },
//           uBlack:       { value: uBlack },
//           uSliceOffset: { value: new THREE.Vector3() }
//         }
//       }),
//     [] // se clona luego, no dependas de los sliders aquí
//   );

//   // Creamos una copia por slice
//   const materials = useMemo(() => {
//     return Array.from({ length: nSlices }, (_, i) => {
//       const z = startZ + i * (thickness + gap);
//       const mat = baseMaterial.clone();
//       mat.uniforms.uSliceOffset.value = new THREE.Vector3(0, 0, z);
//       return mat;
//     });
//   }, [nSlices, thickness, gap, baseMaterial, startZ]);

//   useFrame(({ clock }) => {
//     materials.forEach(mat => {
//       mat.uniforms.uTime.value      = clock.getElapsedTime();
//       mat.uniforms.uZoom.value      = uZoom;
//       mat.uniforms.uDisplaceX.value = uDisplaceX;
//       mat.uniforms.uDisplaceY.value = uDisplaceY;
//       mat.uniforms.uDisplaceZ.value = uDisplaceZ;
//       mat.uniforms.uWhite.value     = uWhite;
//       mat.uniforms.uBlack.value     = uBlack;
//     });
//   });

//   const containerHeight = nSlices * (thickness + gap);
//   const containerSize = new THREE.Vector3(size, size, containerHeight);
//   const containerPosition = new THREE.Vector3(0, 0, startZ + (containerHeight - thickness) / 2);

//   return (
//     <>

//       <mesh position={containerPosition}>
//         <boxGeometry args={[containerSize.x*1.05, containerSize.y*1.05, containerSize.z*1.05]} />
//         <MeshTransmissionMaterial color="#CCCCCC"/>
//       </mesh>
  
//       {materials.map((mat, i) => (
//         <mesh
//           key={i}
//           geometry={geometry}
//           material={mat}
//           position={[0, 0, startZ + i * (thickness + gap)]}
//         />
//       ))}

//     </>
//   );
// }


import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { DoubleSide } from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei'; // asegurate de tener esto instalado

const vertexShader = `

  varying vec3  vPosition;
  varying vec2  vUv;
  uniform vec3  uSliceOffset;

  void main() {
      vPosition = position - uSliceOffset;
      vUv = uv;
      vec3 newPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `

  precision mediump float;

  uniform float uTime;
  uniform float uZoom;
  uniform float uDisplaceX;
  uniform float uDisplaceY;
  uniform float uDisplaceZ;
  uniform float uBlack;
  uniform float uWhite;

  varying vec2  vUv;
  varying vec3  vPosition;

  #define NMAX 100

  float lyapunov(vec3 coord) {
      float x = 0.5;
      float sum = 0.0;

      for (int i = 0; i < NMAX; i++) {
          int pos = int(mod(float(i), 6.0));
          float r = 0.0;
          if (pos == 0 || pos == 1) {
              r = coord.x;
          } else if (pos ==2 || pos == 3) {
              r = coord.y;
          } else {
              r = coord.z;
          }
          x = r * x * (1.0 - x);
          sum += log(abs(r - 2.0 * r * x));
      }

      return sum / float(NMAX);
  }

  vec3 palette(float t) {
      float r = smoothstep(0.0, 0.5, t);
      float g = smoothstep(0.25, 0.75, t);
      float b = smoothstep(0.5, 1.0, t);
      float intensity = mix(0.50, 1.0, t);
      return vec3(r * intensity, g * intensity, b * intensity);
  }

  void main() {
      vec3 coord = (vPosition + vec3(uDisplaceX,uDisplaceY,uDisplaceZ)) * uZoom;
      float val = smoothstep(-1.0, 1.0, lyapunov(coord));
      vec3 color = palette(val);

      float dist1 = distance(color,vec3(1.0));
      float dist2 = distance(color,vec3(0.0));

      vec4 fColor =  vec4(color,1.0);

      if (dist1 < uWhite) 
      {
        discard;
        //fColor = vec4(vec3(1.0,0.0,0.0),0.01);
      }
      if (dist2 < uBlack) 
      {
        discard;
        //fColor = vec4(vec3(1.0,0.0,0.0),0.01);
      }

      gl_FragColor = fColor;
  }
`;

export default function Lyapunov3D() {
  const {
    sliceAxis,
    uZoom,
    uDisplaceX,
    uDisplaceY,
    uDisplaceZ,
    uWhite,
    uBlack,
    nSlices,
    thickness,
    gap
  } = useControls({
    sliceAxis: { options: ['x', 'y', 'z'], value: 'z', label: 'Eje de rebanado' },
    uZoom:      { value: 1.48, min: 0.1, max: 10, step: 0.001 },
    uDisplaceX: { value: 0.55, min: -10, max: 20, step: 0.001 },
    uDisplaceY: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uDisplaceZ: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uWhite:     { value: 1.0, min: 0, max: 1, step: 0.001 },
    uBlack:     { value: 0.2, min: 0, max: 1, step: 0.001 },
    nSlices:    { value: 200, min: 1, max: 1000, step: 1 },
    thickness:  { value: 0.005, min: 0.001, max: 0.5, step: 0.001 },
    gap:        { value: 0.00, min: 0, max: 1, step: 0.001 }
  });

  const size = 4;
  const startOffset = -size / 2 + thickness / 2;

  const geometry = useMemo(() => {
    if (sliceAxis === 'z') {
      return new THREE.BoxGeometry(size, size, thickness, 128, 128, 1);
    } else if (sliceAxis === 'y') {
      return new THREE.BoxGeometry(size, thickness, size, 128, 1, 128);
    } else {
      return new THREE.BoxGeometry(thickness, size, size, 1, 128,128);
    }
  }, [size, thickness, sliceAxis]);

  const baseMaterial = useMemo(() =>
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uTime:        { value: 0 },
        uZoom:        { value: uZoom },
        uDisplaceX:   { value: uDisplaceX },
        uDisplaceY:   { value: uDisplaceY },
        uDisplaceZ:   { value: uDisplaceZ },
        uWhite:       { value: uWhite },
        uBlack:       { value: uBlack },
        uSliceOffset: { value: new THREE.Vector3() }
      }
    }), []
  );

  const materials = useMemo(() => {
    return Array.from({ length: nSlices }, (_, i) => {
      const offset = i * (thickness + gap);
      const offsetVec = new THREE.Vector3();

      if (sliceAxis === 'z') offsetVec.z = startOffset + offset;
      else if (sliceAxis === 'y') offsetVec.y = startOffset + offset;
      else if (sliceAxis === 'x') offsetVec.x = startOffset + offset;

      const mat = baseMaterial.clone();
      mat.uniforms.uSliceOffset.value = offsetVec;
      return mat;
    });
  }, [nSlices, thickness, gap, baseMaterial, startOffset, sliceAxis]);

  useFrame(({ clock }) => {
    materials.forEach(mat => {
      mat.uniforms.uTime.value      = clock.getElapsedTime();
      mat.uniforms.uZoom.value      = uZoom;
      mat.uniforms.uDisplaceX.value = uDisplaceX;
      mat.uniforms.uDisplaceY.value = uDisplaceY;
      mat.uniforms.uDisplaceZ.value = uDisplaceZ;
      mat.uniforms.uWhite.value     = uWhite;
      mat.uniforms.uBlack.value     = uBlack;
    });
  });

  // Calcular caja envolvente
  const totalLength = nSlices * (thickness + gap);
  const containerSize = new THREE.Vector3(
    sliceAxis === 'x' ? totalLength : size,
    sliceAxis === 'y' ? totalLength : size,
    sliceAxis === 'z' ? totalLength : size
  );

  const containerPosition = new THREE.Vector3(
    sliceAxis === 'x' ? startOffset + (totalLength - thickness) / 2 : 0,
    sliceAxis === 'y' ? startOffset + (totalLength - thickness) / 2 : 0,
    sliceAxis === 'z' ? startOffset + (totalLength - thickness) / 2 : 0
  );

  return (
    <>
      {/* Caja envolvente */}
      <mesh position={containerPosition}>
        <boxGeometry args={[
          containerSize.x * 1.05,
          containerSize.y * 1.05,
          containerSize.z * 1.05
        ]} />
        <MeshTransmissionMaterial color="#CCCCCC" />
      </mesh>

      {/* Rebanadas */}
      {materials.map((mat, i) => {
        const offset = i * (thickness + gap);
        const pos = new THREE.Vector3(0, 0, 0);

        if (sliceAxis === 'z') pos.z = startOffset + offset;
        else if (sliceAxis === 'y') pos.y = startOffset + offset;
        else if (sliceAxis === 'x') pos.x = startOffset + offset;


        return (
          <mesh
            key={i}
            geometry={geometry}
            material={mat}
            position={pos.toArray()}
            castShadow
          />
        );
      })}
    </>
  );
}
