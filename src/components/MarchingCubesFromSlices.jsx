// MarchingCubesFromSlices.jsx
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { useControls } from 'leva'
import isosurface from 'isosurface'

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

      if (dist1 < uWhite) discard;
      if (dist2 < uBlack) discard;

      gl_FragColor = vec4(color,1.0);
  }
`;

export default function MarchingCubesFromSlices({
  nSlices = 128,
  resolution = 128,
  thickness = 0.01,
  level = 0.5
}) {
  const { gl } = useThree()
  const [geometry, setGeometry] = useState(null)
  const [colors, setColors] = useState(null)

  const {
    uZoom,
    uDisplaceX,
    uDisplaceY,
    uDisplaceZ,
    uWhite,
    uBlack
  } = useControls('Marching Cubes Shader', {
    uZoom: { value: 1.48, min: 0.1, max: 10, step: 0.001 },
    uDisplaceX: { value: 0.55, min: -10, max: 20, step: 0.001 },
    uDisplaceY: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uDisplaceZ: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uWhite: { value: 1.0, min: 0, max: 1, step: 0.001 },
    uBlack: { value: 0.2, min: 0, max: 1, step: 0.001 }
  })

  const uniforms = {
    uZoom: { value: uZoom },
    uDisplaceX: { value: uDisplaceX },
    uDisplaceY: { value: uDisplaceY },
    uDisplaceZ: { value: uDisplaceZ },
    uWhite: { value: uWhite },
    uBlack: { value: uBlack },
    uSliceOffset: { value: new THREE.Vector3() }
  }

  useEffect(() => {
    const scalarField = []
    const colorField = []
    const rt = new THREE.WebGLRenderTarget(resolution, resolution)
    const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    orthoCam.position.z = 1

    const planeGeo = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    })
    const quad = new THREE.Mesh(planeGeo, material)
    const quadScene = new THREE.Scene()
    quadScene.add(quad)

    for (let i = 0; i < nSlices; i++) {
      const slicePixels = new Uint8Array(resolution * resolution * 4)
      uniforms.uSliceOffset.value.set(0, 0, i * thickness)
      gl.setRenderTarget(rt)
      gl.render(quadScene, orthoCam)
      gl.readRenderTargetPixels(rt, 0, 0, resolution, resolution, slicePixels)

      const slice = []
      const colorSlice = []
      for (let y = 0; y < resolution; y++) {
        const row = []
        const colorRow = []
        for (let x = 0; x < resolution; x++) {
          const idx = (y * resolution + x) * 4
          const r = slicePixels[idx] / 255
          const g = slicePixels[idx + 1] / 255
          const b = slicePixels[idx + 2] / 255
          row.push(r)
          colorRow.push([r, g, b])
        }
        slice.push(row)
        colorSlice.push(colorRow)
      }
      scalarField.push(slice)
      colorField.push(colorSlice)
    }
    gl.setRenderTarget(null)

    const mesh = isosurface.marchingCubes([nSlices, resolution, resolution], (x, y, z) => {
      return scalarField[x][y][z] - level
    })

    const geo = new THREE.BufferGeometry()
    const positions = mesh.positions.flat()
    const indices = mesh.cells.flat()
    const vertexColors = []

    for (let i = 0; i < mesh.positions.length; i++) {
      const [x, y, z] = mesh.positions[i]
      const xi = Math.min(nSlices - 1, Math.floor(x))
      const yi = Math.min(resolution - 1, Math.floor(y))
      const zi = Math.min(resolution - 1, Math.floor(z))
      const color = colorField[xi][yi][zi]
      vertexColors.push(...color)
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    setGeometry(geo)
  }, [nSlices, resolution, thickness, level, uZoom, uDisplaceX, uDisplaceY, uDisplaceZ, uWhite, uBlack])

  if (!geometry) return null

  return (
    <mesh geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  )
}
