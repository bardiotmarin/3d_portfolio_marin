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
      
      {/* Poche de gaz 1 : Violet profond */}
      <Cloud
        opacity={0.25}
        speed={0.4}
        width={12}
        depth={1.5}
        segments={25}
        position={[-5, -3, -12]}
        color="#8b5cf6"
      />

      {/* Poche de gaz 2 : Bleu cosmique */}
      <Cloud
        opacity={0.3}
        speed={0.3}
        width={15}
        depth={2}
        segments={30}
        position={[6, 3, -18]}
        color="#3b82f6"
      />

      {/* Poche de gaz 3 : Rose néon */}
      <Cloud
        opacity={0.2}
        speed={0.5}
        width={18}
        depth={1.5}
        segments={20}
        position={[0, 0, -25]}
        color="#ec4899"
      />

      {/* Poche de gaz 4 : Cyan électrique */}
      <Cloud
        opacity={0.2}
        speed={0.35}
        width={10}
        depth={1.8}
        segments={22}
        position={[-8, 4, -15]}
        color="#06b6d4"
      />

      {/* Poche de gaz 5 : Violet clair (accent) */}
      <Cloud
        opacity={0.15}
        speed={0.45}
        width={14}
        depth={1.2}
        segments={18}
        position={[4, -2, -20]}
        color="#a78bfa"
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
