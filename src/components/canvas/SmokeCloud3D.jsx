import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SmokeCloud3D = ({
  count = 30,
  area = [2.2, 1.2, 0.7],
  position = [0, 0, 0],
  color = "#B8CEF9",
  minRadius = 0.16,
  maxRadius = 0.42,
  opacity = 0.16,
}) => {
  const refs = useMemo(() => Array.from({ length: count }, () => React.createRef()), [count]);
  const offsets = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        theta: Math.random() * Math.PI * 2,
        speed: 0.06 + Math.random() * 0.09,
        amplitude: 0.11 + Math.random() * 0.1,
      })),
    [count]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (ref.current) {
        const { theta, speed, amplitude } = offsets[i];
        ref.current.position.x += Math.sin(t * speed + theta) * amplitude * 0.0012;
        ref.current.position.y += Math.cos(t * speed + theta) * amplitude * 0.0012;
        ref.current.material.opacity = opacity + Math.sin(t * speed + theta * 3) * 0.08;
      }
    });
  });

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={refs[i]}
          position={[
            (Math.random() - 0.5) * area[0],
            (Math.random() - 0.5) * area[1],
            (Math.random() - 0.5) * area[2],
          ]}
        >
          <sphereGeometry args={[minRadius + Math.random() * (maxRadius - minRadius), 24, 16]} />
          <meshPhongMaterial
            color={color}
            transparent
            opacity={opacity}
            blending={THREE.AdditiveBlending}
            shininess={0.07}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SmokeCloud3D;
