import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

const Box = () => {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.x += 0.002;
    ref.current.rotation.y += 0.002;
  });

  return (
    <>
      <mesh ref={ref}>
        <boxGeometry args={[5, 5, 5]} />
        <meshBasicMaterial color={"red"} />
      </mesh>
    </>
  );
};

export default function Experience({}) {
  return (
    <div>
      <Canvas>
        <Box />
      </Canvas>
    </div>
  );
}