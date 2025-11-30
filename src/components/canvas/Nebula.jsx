import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Cloud, Preload } from "@react-three/drei";
import * as THREE from "three";

// Composant pour les éclairs subtils dans la nébuleuse
const NebularLightning = () => {
  const lightning1 = useRef();
  const lightning2 = useRef();
  const lightning3 = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Éclair 1 : Pulse lent et aléatoire
    if (lightning1.current) {
      const flicker = Math.sin(time * 2) * 0.5 + 0.5;
      const random = Math.random() > 0.98 ? 2 : 0; // Flash rare
      lightning1.current.intensity = (flicker + random) * 1.5;
    }

    // Éclair 2 : Pulse plus rapide
    if (lightning2.current) {
      const flicker = Math.sin(time * 3.5) * 0.5 + 0.5;
      const random = Math.random() > 0.97 ? 3 : 0;
      lightning2.current.intensity = (flicker + random) * 1.2;
    }

    // Éclair 3 : Pulse très subtil
    if (lightning3.current) {
      const flicker = Math.sin(time * 1.5) * 0.5 + 0.5;
      lightning3.current.intensity = flicker * 0.8;
    }
  });

  return (
    <>
      {/* Éclair violet électrique */}
      <pointLight
        ref={lightning1}
        position={[-6, -3, -12]}
        color="#c026d3"
        intensity={1.5}
        distance={15}
        decay={2}
      />

      {/* Éclair bleu cosmique */}
      <pointLight
        ref={lightning2}
        position={[7, 4, -15]}
        color="#0ea5e9"
        intensity={1.2}
        distance={18}
        decay={2}
      />

      {/* Éclair cyan subtil */}
      <pointLight
        ref={lightning3}
        position={[-8, 5, -14]}
        color="#22d3ee"
        intensity={0.8}
        distance={12}
        decay={2}
      />
    </>
  );
};

const NebulaScene = () => {
  const cloudGroup = useRef();

  // Animation douce de rotation pour tout le groupe
  useFrame((state, delta) => {
    if (cloudGroup.current) {
      cloudGroup.current.rotation.y += delta * 0.015;
      cloudGroup.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <>
      {/* ÉCLAIRAGE AMBIANT - Pour rendre les nuages visibles */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />

      {/* Éclairs subtils dans la nébuleuse */}
      <NebularLightning />

      <group ref={cloudGroup}>
        {/* Fond étoilé principal */}
        <Stars 
          radius={300} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.3} 
        />
        
        {/* Étoiles immersives dans les nuages */}
        <Stars 
          radius={100} 
          depth={30} 
          count={2000} 
          factor={3} 
          saturation={0} 
          fade 
          speed={0.2}
        />
        
        {/* Poche de gaz 1 : Violet électrique intense */}
        <Cloud
          opacity={0.35}
          speed={0.08}
          width={18}
          depth={3}
          segments={40}
          position={[-6, -3, -12]}
          color="#c026d3"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 2 : Bleu lumineux */}
        <Cloud
          opacity={0.4}
          speed={0.06}
          width={22}
          depth={3.5}
          segments={45}
          position={[7, 4, -15]}
          color="#0ea5e9"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 3 : Rose néon vif */}
        <Cloud
          opacity={0.32}
          speed={0.1}
          width={25}
          depth={3}
          segments={35}
          position={[0, 1, -20]}
          color="#f472b6"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 4 : Cyan brillant */}
        <Cloud
          opacity={0.3}
          speed={0.07}
          width={17}
          depth={3.2}
          segments={38}
          position={[-8, 5, -14]}
          color="#22d3ee"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 5 : Orange cosmique */}
        <Cloud
          opacity={0.3}
          speed={0.09}
          width={20}
          depth={2.8}
          segments={33}
          position={[6, -4, -18]}
          color="#fb923c"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 6 : Vert aurore */}
        <Cloud
          opacity={0.28}
          speed={0.08}
          width={15}
          depth={2.5}
          segments={30}
          position={[-4, 0, -22]}
          color="#4ade80"
          bounds={[20, 10, 20]}
        />

        {/* Poche de gaz 7 : Violet clair (remplissage) */}
        <Cloud
          opacity={0.25}
          speed={0.05}
          width={16}
          depth={2.2}
          segments={28}
          position={[4, 2, -17]}
          color="#a78bfa"
          bounds={[20, 10, 20]}
        />
      </group>
    </>
  );
};

const NebulaCanvas = () => {
  return (
    <div className='w-full h-auto absolute inset-0 z-[-1]'>
      <Canvas 
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <Suspense fallback={null}>
          <NebulaScene />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default NebulaCanvas;
