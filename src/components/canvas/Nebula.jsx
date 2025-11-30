import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Cloud, Preload, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Composant pour l'effet bioluminescent qui suit la souris
const Bioluminescence = () => {
  const { viewport, camera } = useThree();
  const [mousePos, setMousePos] = useState(new THREE.Vector3(0, 0, -10));
  const lightRef = useRef();
  const trailRef = useRef();

  useFrame((state) => {
    // Convertir la position de la souris en coordonnées 3D
    const x = (state.mouse.x * viewport.width) / 2;
    const y = (state.mouse.y * viewport.height) / 2;
    const z = -10; // Profondeur où se trouvent les nuages

    // Interpolation douce (lerp) pour un mouvement fluide
    if (lightRef.current) {
      lightRef.current.position.x += (x - lightRef.current.position.x) * 0.1;
      lightRef.current.position.y += (y - lightRef.current.position.y) * 0.1;
      lightRef.current.position.z = z;
    }

    if (trailRef.current) {
      trailRef.current.position.x = lightRef.current.position.x;
      trailRef.current.position.y = lightRef.current.position.y;
      trailRef.current.position.z = z;
    }
  });

  return (
    <group>
      {/* Lumière qui suit la souris - effet d'illumination du plancton */}
      <pointLight
        ref={lightRef}
        color="#00ffff"
        intensity={3}
        distance={15}
        decay={2}
      />

      {/* Traînée lumineuse - sillage bioluminescent */}
      <Trail
        width={2}
        length={6}
        color={new THREE.Color(0, 1, 1)}
        attenuation={(t) => t * t}
      >
        <mesh ref={trailRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
      </Trail>

      {/* Particules de plancton autour du curseur */}
      <Sparkles
        count={50}
        scale={8}
        size={2}
        speed={0.4}
        opacity={0.6}
        color="#00ffff"
        position={[mousePos.x, mousePos.y, -10]}
      />
    </group>
  );
};

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
    <>
      {/* ÉCLAIRAGE AMBIANT - Pour rendre les nuages visibles */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Effet bioluminescent interactif */}
      <Bioluminescence />

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
    </>
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
