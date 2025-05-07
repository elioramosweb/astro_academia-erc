// SphereWithShader.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva';
import { ShaderMaterial } from 'three'
import { DoubleSide } from 'three'

const vertexShader = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
        vNormal = normal;
        vPosition = position;
        vUv = uv;
        vec3 newPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`

const fragmentShader = `
    #define ITERATIONS 500.
    #define PI 3.141592653589793
    #define NMAX 100
    
    uniform float uTime;
    uniform float uDisplaceX;
    uniform float uDisplaceY;
    uniform float uWhite;
    uniform float uBlack;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    vec3 hotPalette(float t) {
        float r = smoothstep(0.0, 0.5, t); 
        float g = smoothstep(0.25, 0.75, t); 
        float b = smoothstep(0.5, 1.0, t);
        float intensity = mix(0.50, 1.0, t);
        return vec3(r * intensity, g * intensity, b * intensity);
    }
    
    
    float lyapunov(vec2 coord) {
        float x = 0.5;
        float sum = 0.0;
        for(int i = 0; i < NMAX; i++) {
            int pos = int(mod(float(i),5.));
            float p = (pos == 0 || pos == 3 || pos == 0) ? 1.0 : 0.0;
            float r = mix(coord.x,coord.y,p);
                    x = r * x *(1.0 - x);
            sum += log(abs(r - 2.0 * r * x));
        }
        return sum/float(NMAX);
    }

    void main() {

        vec2 uv = vUv;

        uv.x += uDisplaceX;
        uv.y += uDisplaceY;
    
        float lyap = smoothstep(-1.0, 0.8, lyapunov(uv));
        vec3 col = hotPalette(lyap);

        float distWhite = distance(col,vec3(1.0));
        float distBlack = distance(col,vec3(0.0));

        if (distWhite < uWhite || distBlack < uBlack) {
          discard;
        }

        gl_FragColor = vec4(col, 1.0);
      }
  `

export default function PlaneWithShader() {
  const shaderRef = useRef();

  // 1. Desestructura TODOS los valores, incluido uZoom
  const { uZoom, uDisplaceX, uDisplaceY, uWhite, uBlack } = useControls({
    uZoom:      { value: 1, min: 0, max: 2, step: 0.01 },
    uDisplaceX: { value: 2, min: 0, max: 5, step: 0.01 },
    uDisplaceY: { value: 2, min: 0, max: 5, step: 0.01 },
    uWhite:     { value: 0, min: 0, max: 1, step: 0.01 },
    uBlack:     { value: 0, min: 0, max: 1, step: 0.01 },
  });

  // 2. Cada frame, actualiza todos los uniformes
  useFrame(({ clock }) => {
    const mat = shaderRef.current?.uniforms;
    if (mat) {
      mat.uTime.value       = clock.getElapsedTime();
      mat.uZoom.value       = uZoom;
      mat.uDisplaceX.value  = uDisplaceX;
      mat.uDisplaceY.value  = uDisplaceY;
      mat.uWhite.value      = uWhite;
      mat.uBlack.value      = uBlack;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[5, 5, 64, 64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime:       { value: 0 },
          // Inicializa con el valor de Leva para evitar flicker
          uZoom:       { value: uZoom },
          uDisplaceX:  { value: uDisplaceX },
          uDisplaceY:  { value: uDisplaceY },
          uWhite:      { value: uWhite },
          uBlack:      { value: uBlack },
        }}
        side={DoubleSide}
      />
    </mesh>
  );
}
