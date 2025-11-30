import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Cloud, Preload } from "@react-three/drei";

const NebulaScene = () => {
  const cloudGroup = useRef();

  // Animation douce de rotation pour tout le groupe
  useFrame((state, delta) => {
    if (cloudGroup.current) {
      cloudGroup.current.rotation.y += delta * 0.02;
      cloudGroup.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group ref={cloudGroup}>
      {/* Fond étoilé classique */}
      <Stars 
        radius={300} 
        depth={60} 
        count={7000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      
      {/* Poche de gaz 1 : Violet électrique intense */}
      <Cloud
        opacity={0.6}
        speed={0.4}
        width={15}
        depth={2}
        segments={35}
        position={[-5, -2, -10]}
        color="#c026d3"
      />

      {/* Poche de gaz 2 : Bleu lumineux */}
      <Cloud
        opacity={0.65}
        speed={0.3}
        width={18}
        depth={2.5}
        segments={40}
        position={[6, 3, -14]}
        color="#0ea5e9"
      />

      {/* Poche de gaz 3 : Rose néon vif */}
      <Cloud
        opacity={0.55}
        speed={0.5}
        width={20}
        depth={2}
        segments={30}
        position={[0, 1, -18]}
        color="#f472b6"
      />

      {/* Poche de gaz 4 : Cyan brillant */}
      <Cloud
        opacity={0.5}
        speed={0.35}
        width={14}
        depth={2.2}
        segments={32}
        position={[-7, 4, -12]}
        color="#22d3ee"
      />

      {/* Poche de gaz 5 : Orange cosmique */}
      <Cloud
        opacity={0.5}
        speed={0.45}
        width={16}
        depth={1.8}
        segments={28}
        position={[5, -3, -16]}
        color="#fb923c"
      />

      {/* Poche de gaz 6 : Vert aurore */}
      <Cloud
        opacity={0.45}
        speed={0.4}
        width={12}
        depth={1.5}
        segments={25}
        position={[-3, 0, -20]}
        color="#4ade80"
      />
    </group>
  );
};

const NebulaCanvas = () => {
  return (
    <div className='w-full h-auto absolute inset-0 z-[-1]'>
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <Suspense fallback={null}>
          <NebulaScene />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default NebulaCanvas;
