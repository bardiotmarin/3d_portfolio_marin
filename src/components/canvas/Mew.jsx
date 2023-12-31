
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Moon from "./Moon";

const Mew = ({ scale, positionX, positionY }) => {
  const computer = useGLTF("/desktop_pc/scene.gltf");

  return (
      <mesh>
        {/* Lighting */}
        <hemisphereLight intensity={0.15} groundColor="black" />
        <spotLight
            position={[50, 10, 70]}
            angle={0.12}
            penumbra={1}
            intensity={1}
            castShadow={true}
            shadow-mapSize={1024}
        />
        <pointLight intensity={1} />

        {/* Computer model */}
        <primitive
            object={computer.scene}
            scale={scale}
            position={[positionX, positionY, -0]}
            rotation={[-0.11, -5.0, -0.10]}
        />
      </mesh>
  );
};
const MewCanvas = () => {
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

  // Définir les résolutions personnalisées (ajoutez plus si nécessaire)
  const qhdResolution = 2560;
  const fhdResolution = 1920;
  const laptopResolution = 1440;
  const tabletResolution = 768;

  // Déterminez la résolution 4K (3840 pixels)
  const is4KScreen = screenWidth >= 3840;

  // Ajuster la taille de l'objet en fonction de la largeur de l'écran
  let scale, positionX, positionY;

  if (is4KScreen) {
    scale = 0.222; // Doubler la taille pour les écrans 4K (3840x2160) et plus grands
    positionX = 2; // Déplacer l'objet vers la droite pour les écrans 4K et plus grands
    positionY = 2; // Déplacer l'objet un peu vers le haut pour les écrans 4K et plus grands
  }else if (screenWidth >= qhdResolution) {
    scale = 0.084; // Garder la taille d'origine pour les écrans FHD (1920x1080) et plus grands
    positionX = -2; // Déplacer l'objet vers la gauche pour les écrans FHD et plus grands
    positionY = -0.6; // Déplacer l'objet vers le bas pour les écrans FHD et plus grands
  }
  else if (screenWidth >= fhdResolution) {
    scale = 0.056; // Garder la taille d'origine pour les écrans FHD (1920x1080) et plus grands
    positionX = -2; // Déplacer l'objet vers la gauche pour les écrans FHD et plus grands
    positionY = -2; // Déplacer l'objet vers le bas pour les écrans FHD et plus grands
  } else if (screenWidth >= laptopResolution) {
    scale = 0.060; // Garder la taille d'origine pour les écrans FHD (1420x1080) et plus grands
    positionX = 1.5; // Déplacer l'objet vers la gauche pour les écrans FHD et plus grands
    positionY = -1; // Déplacer l'objet vers le bas pour les écrans FHD et plus grands
  }
  else if (screenWidth >= tabletResolution) {
    scale = 0.050 // Garder la taille d'origine pour les écrans FHD (1920x1080) et plus grands
    positionX = -1.41; // Déplacer l'objet vers la gauche pour les écrans FHD et plus grands
    positionY = -0.8; // Déplacer l'objet vers le bas pour les écrans FHD et plus grands
  }
  else if (screenWidth < 500) {
    scale = 0.030; // Garder la taille d'origine pour les petits écrans
    positionX = -1.5; // Déplacer l'objet vers la gauche pour les petits écrans
    positionY = -1; // Déplacer l'objet vers le bas pour les petits écrans
  } else {
    scale = 0.0022; // Garder la taille d'origine pour les écrans de résolution inférieure à 1920x1080
    positionX = 0; // Réinitialiser la position X pour les écrans de résolution inférieure à 1920x1080
    positionY = -1; // Déplacer l'objet vers le bas pour les écrans de résolution inférieure à 1920x1080
  }

  return (
      <Canvas
          frameloop="demand"
          shadows
          dpr={[0, 1]}
          camera={{ position: [20, 3, 5], fov: 25 }}
          gl={{ preserveDrawingBuffer: true, antialias: true  }}
      >

          <OrbitControls
              enablePan={false} // Désactiver le déplacement de la caméra avec clic droit
              autoRotate
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
          />
          <Mew scale={scale} positionX={positionX} positionY={positionY} />
          <Moon />


      </Canvas>
  );
};

export default MewCanvas;
