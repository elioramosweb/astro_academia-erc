// PlaneWithShader.jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { DoubleSide } from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  #define NMAX 10000

  uniform float uTime;
  uniform float uZoom;
  uniform float uDisplaceX;
  uniform float uDisplaceY;
  uniform float uWhite;
  uniform float uBlack;

  varying vec2 vUv;

  float lyapunov(vec2 coord) {
    float x = 0.5;
    float sum = 0.0;
    for(int i = 0; i < NMAX; i++) {
      float p = mod(float(i), 2.0) < 1.0 ? coord.x : coord.y;
      x = p * x * (1.0 - x);
      sum += log(abs(p - 2.0 * p * x));
    }
    return sum / float(NMAX);
  }

  vec3 hotPalette(float t) {
    float r = smoothstep(0.0, 0.5, t);
    float g = smoothstep(0.25, 0.75, t);
    float b = smoothstep(0.5, 1.0, t);
    return vec3(r, g, b) * mix(0.5, 1.0, t);
  }

  void main() {
  
    vec2 uv = (vUv - 0.5) * uZoom + 0.5;

    uv.x += uDisplaceX;
    uv.y += uDisplaceY;

    float l = smoothstep(-1.0, 1.0, lyapunov(uv));
    vec3 col = hotPalette(l);


    if (distance(col, vec3(1.0)) < uWhite ||
        distance(col, vec3(0.0)) < uBlack) {
      discard;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PlaneWithShader() {
  const shaderRef = useRef();

  // 1) Sliders de Leva
  const { uZoom, uDisplaceX, uDisplaceY, uWhite, uBlack } = useControls({
    uZoom:      { value: 3.33,  min: 0.1, max: 10,   step: 0.001 },
    uDisplaceX: { value: 2,  min:-10,  max: 20,   step: 0.001 },
    uDisplaceY: { value: 1.90,  min:-10,  max: 20,   step: 0.001 },
    uWhite:     { value: 0,  min: 0,   max: 1,   step: 0.001 },
    uBlack:     { value: 0,  min: 0,   max: 1,   step: 0.001 },
  });

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uZoom:       { value: 1 },
    uDisplaceX:  { value: 0 },
    uDisplaceY:  { value: 0 },
    uWhite:      { value: 0 },
    uBlack:      { value: 0 },
  }), []);


  useFrame(({ clock }) => {
    const u = shaderRef.current?.uniforms;
    if (!u) return;

    u.uTime.value      = clock.getElapsedTime();
    u.uZoom.value      = uZoom;
    u.uDisplaceX.value = uDisplaceX;
    u.uDisplaceY.value = uDisplaceY;
    u.uWhite.value     = uWhite;
    u.uBlack.value     = uBlack;
  });

  return (
    <mesh>
      <planeGeometry args={[5, 5, 64, 64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={DoubleSide}
      />
    </mesh>
  );
}
