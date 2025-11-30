import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture, Sphere } from "@react-three/drei";

function TechBall({ textureUrl, position, scale = 1 }) {
  // Vérification et chargement de texture
  let texture;
  try {
    texture = useTexture(textureUrl);
  } catch (error) {
    console.error('Erreur texture:', textureUrl, error);
    return null;
  }

  return (
    <Sphere args={[1, 32, 32]} position={position} scale={scale}>
      <meshStandardMaterial 
        map={texture} 
        metalness={0.5} 
        roughness={0.5}
      />
    </Sphere>
  );
}

export default function TechBalls({ technologies }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {technologies.map((tech, index) => (
        <TechBall
          key={tech.name}
          textureUrl={tech.icon}
          position={[
            (index % 3) * 2.5 - 2.5,
            Math.floor(index / 3) * 2.5 - 2.5,
            0
          ]}
        />
      ))}
      
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}
