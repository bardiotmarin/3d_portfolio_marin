import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Cloud, Preload, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Composant pour l'effet bioluminescent qui suit la souris
const Bioluminescence = () => {
  const { viewport } = useThree();
  const lightRef = useRef();
  const trailRef = useRef();
  const sparklesRef = useRef();

  useFrame((state) => {
    // Convertir la position de la souris en coordonnées 3D
    const x = (state.mouse.x * viewport.width) / 2;
    const y = (state.mouse.y * viewport.height) / 2;
    const z = -10; // Profondeur où se trouvent les nuages

    // Interpolation douce (lerp) pour un mouvement fluide
    if (lightRef.current) {
      lightRef.current.position.x += (x - lightRef.current.position.x) * 0.15;
      lightRef.current.position.y += (y - lightRef.current.position.y) * 0.15;
      lightRef.current.position.z = z;
    }

    if (trailRef.current) {
      trailRef.current.position.x = lightRef.current.position.x;
      trailRef.current.position.y = lightRef.current.position.y;
      trailRef.current.position.z = z;
    }

    if (sparklesRef.current) {
      sparklesRef.current.position.x = lightRef.current.position.x;
      sparklesRef.current.position.y = lightRef.current.position.y;
      sparklesRef.current.position.z = z;
    }
  });

  return (
    <group>
      {/* Lumière qui suit la souris - effet d'illumination du plancton */}
      <pointLight
        ref={lightRef}
        color="#00ffff"
        intensity={5}
        distance={20}
        decay={2}
      />

      {/* Traînée lumineuse - sillage bioluminescent */}
      <Trail
        width={3}
        length={8}
        color={new THREE.Color(0, 1, 1)}
        attenuation={(t) => t * t}
      >
        <mesh ref={trailRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
        </mesh>
      </Trail>

      {/* Particules de plancton autour du curseur */}
      <Sparkles
        ref={sparklesRef}
        count={80}
        scale={10}
        size={3}
        speed={0.6}
        opacity={0.8}
        color="#00ffff"
      />
    </group>
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

      {/* Effet bioluminescent interactif */}
      <Bioluminescence />

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
        eventSource={document.getElementById('root')}
        eventPrefix="client"
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
