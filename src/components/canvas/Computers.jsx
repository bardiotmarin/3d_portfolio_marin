import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { useTexture } from "@react-three/drei";

import CanvasLoader from "../Loader";

// Composant représentant l'objet 3D d'ordinateur
const Computers = ({ scale }) => {
  // Charger le modèle 3D de l'ordinateur
  const computer = useGLTF("./desktop_pc/scene.gltf");

  return (
    <mesh>
      {/* Ajouter un éclairage à la scène */}
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[50, 10, 70]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />

      {/* Ajouter l'objet 3D de l'ordinateur en tant que primitive */}
      <primitive
        object={computer.scene}
        scale={scale}
        position={[-1, -2, -0]}
        rotation={[-0.11, -5.0, -0.10]} // Rotation de l'objet (optionnelle)
      />
    </mesh>
  );
};

// Composant principal contenant la scène 3D avec l'objet d'ordinateur
const ComputersCanvas = () => {
  // État pour détecter la taille de l'écran
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Ajouter un écouteur pour les changements de taille d'écran
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Ajouter l'écouteur pour les changements de taille d'écran
    window.addEventListener("resize", handleResize);

    // Supprimer l'écouteur lorsque le composant est démonté
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Ajuster la taille de l'objet en fonction de la largeur de l'écran
  const scale = screenWidth < 500 ? 0.035 : 0.056;

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        {/* Ajouter les contrôles de caméra pour interagir avec la scène 3D */}
        <OrbitControls
          autoRotate
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        {/* Afficher l'objet d'ordinateur dans la scène */}
        <Computers scale={scale} />
      </Suspense>
      {/* Précharger les ressources pour améliorer les performances */}
      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
