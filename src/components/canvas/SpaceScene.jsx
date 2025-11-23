import { useGLTF, Stars, Sphere } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SpaceScene = () => {
  // Charge le modèle GLTF
  const { scene } = useGLTF('/space_boi/scene.gltf');
  const modelRef = useRef();
  const starsRef = useRef();
  const orbitalGroupRef = useRef(); // ✅ Pour les planètes

  // État pour l'échelle responsive
  const [scale, setScale] = useState(2);
  const [maxRotation, setMaxRotation] = useState(Math.PI * 0.39);
  
  // ✅ Suivi du scroll
  const scrollProgress = useRef(0);
  const targetScroll = useRef(0);

  // ✅ Listener pour le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll.current = (scrollY / Math.max(maxScroll, 1)) * 2 - 1;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion du responsive (taille du modèle ET rotation selon l'écran)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 500) {
        setScale(1.2); // Mobile
        setMaxRotation(Math.PI * 0.23); // 60 degrés
      } else if (width < 768) {
        setScale(1.8); // Téléphone
        setMaxRotation(Math.PI * 0.33); // 60 degrés
      } else if (width < 1024) {
        setScale(1.5); // Tablette
        setMaxRotation(Math.PI * 0.33); // 60 degrés
      } else {
        setScale(1.5); // Desktop
        setMaxRotation(Math.PI * 0.35); // 63 degrés
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Animation : étoiles + balancier + scroll + planètes
  useFrame((state, delta) => {
    // Smooth lerp du scroll
    scrollProgress.current = THREE.MathUtils.lerp(
      scrollProgress.current,
      targetScroll.current,
      0.1
    );

    // Personnage : balancier + suivi du scroll
    if (modelRef.current) {
      const speed = 0.15;
      const balancier = Math.sin(state.clock.elapsedTime * speed) * maxRotation;
      const scrollTilt = scrollProgress.current * 0.15;
      
      modelRef.current.rotation.y = balancier;
      modelRef.current.rotation.x = scrollTilt; // ✅ Suit le scroll
    }

    // Étoiles : rotation 360° continue
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.05;
    }

    // ✅ Planètes : orbite 360°
    if (orbitalGroupRef.current) {
      orbitalGroupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      {/* Fond d'étoiles AVEC mouvement 360° */}
      <group ref={starsRef}>
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
      </group>
      
      ✅ Groupe orbital avec planètes/astéroïdes
      <group ref={orbitalGroupRef} position={[0, -1, 0]}>
        {/* Planète bleue */}
        <Sphere args={[0.15, 16, 16]} position={[3, 0.5, 0]}>
          <meshStandardMaterial 
            color="#4477ff" 
            emissive="#2244aa"
            emissiveIntensity={0.80}
            roughness={0.7}
          />
        </Sphere>

        {/* Planète orange */}
        <Sphere args={[0.12, 16, 16]} position={[-2.5, -0.3, 1]}>
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#cc4400"
            emissiveIntensity={0.3}
            roughness={0.6}
          />
        </Sphere>

        {/* Astéroïde gris */}
        <Sphere args={[0.08, 12, 12]} position={[2, -0.8, -1.5]}>
          <meshStandardMaterial 
            color="#888888" 
            roughness={0.9}
            metalness={0.2}
          />
        </Sphere>

        {/* Planète violette */}
        <Sphere args={[0.2, 16, 16]} position={[-3.5, 0.2, -2]}>
          <meshStandardMaterial 
            color="#915EFF" 
            emissive="#6633cc"
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </Sphere>

        {/* Petit astéroïde */}
        <Sphere args={[0.06, 10, 10]} position={[1.5, 0.8, 2]}>
          <meshStandardMaterial 
            color="#cccccc" 
            roughness={0.85}
          />
        </Sphere>
      </group>
      
      {/* Modèle avec balancier + suivi scroll */}
      <primitive 
        ref={modelRef}
        object={scene} 
        scale={scale} 
        position={[0, -2.5, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* Lumières */}
      <ambientLight intensity={2} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={2} color="#4477ff" />
      <pointLight position={[5, -5, -5]} intensity={1} color="#ff6600" />
    </group>
  );
};

// Préchargement
useGLTF.preload('/space_boi/scene.gltf');

export default SpaceScene;
