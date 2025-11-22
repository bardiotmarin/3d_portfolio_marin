import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain } from "./components";
import "./i18n";

// Composant qui précharge invisiblement tous les modèles 3D
const PreloadAssets = () => {
  // Précharger tous les modèles GLTF/GLB
  useGLTF("/desktop_pc/scene.gltf");
  useGLTF("/spaceman/scene.gltf");
  // Ajoute ICI tous tes autres modèles 3D

  return null; // Ne rend rien visuellement
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate the loading process for other components (replace this with your actual data loading logic)
    // For demonstration purposes, we use setTimeout to simulate loading for 3 seconds.
    const timeoutId = setTimeout(() => {
      // Si la progression n'atteint pas 100% après ce délai, forcer l'arrêt du loading
      if (isLoading) {
        setIsLoading(false);
      }
    }, 15000); // Délai max de 15 secondes

    // Logic to detect when all Three.js canvases are loaded
    let loadedCanvasCount = 0;
    const totalCanvasCount = 8; // Replace this with the actual number of Three.js canvases in your Hero component

    const onCanvasLoaded = () => {
      loadedCanvasCount++;
      if (loadedCanvasCount === totalCanvasCount) {
        setIsLoading(false);
      }
    };

    // Add event listeners to each canvas to detect loading completion
    const canvases = document.getElementsByClassName("computer-canvas moon experience-work-container"); 

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      canvas.addEventListener("load", onCanvasLoaded);
    }


    return () => {
      clearTimeout(timeoutId);
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        canvas.removeEventListener("load", onCanvasLoaded);
      }
    };
  }, []);

  // Fonction appelée quand LoaderMain détecte que useProgress atteint 100%
  const handleLoadComplete = () => {
    console.log("✅ Chargement terminé - Affichage du site principal");
    setIsLoading(false);
  };

  return (
    <BrowserRouter>
      {isLoading ? (
        // Écran de préchargement avec Canvas
        <div style={{ 
          width: '100vw', 
          height: '100vh', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          zIndex: 9999,
          backgroundColor: '#000'
        }}>
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 0, 5], fov: 75 }}
          >
            {/* Composant invisible qui précharge les modèles 3D */}
            <PreloadAssets />
            
            {/* LoaderMain affiche la progression réelle */}
            <LoaderMain onLoadComplete={handleLoadComplete} />
            
            {/* Force le préchargement de tous les assets */}
            <Preload all />
          </Canvas>
        </div>
      ) : null}

      {/* Site principal - s'affiche une fois le préchargement terminé */}
      {!isLoading && (
        <div className='relative z-0 bg-primary'>
          <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
            <Navbar />
            <Hero />
          </div>
          <About />
          <Experience />
          <Tech />
          <Works />
          <div className='relative z-0'>
            <Contact />
            <StarsCanvas />
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;