import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain } from "./components";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import Papillon from "./components/canvas/Papillon";
import "./i18n";

// 🔥 PRÉCHARGE TOUS LES MODÈLES 3D
const PreloadAssets = () => {
  useGLTF.preload("/desktop_pc/scene.gltf");
  useGLTF.preload("/spaceman/scene.gltf");
  useGLTF.preload("/papillon/source/vfs.glb"); // 🦋 Papillon ajouté
  // Ajoute ici tous tes autres modèles GLB/GLTF
  return null;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [assetsReady, setAssetsReady] = useState(false);

  // Timeout de sécurité
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("⏱️ Timeout: forçage de la fin du chargement");
        setIsLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const handleLoadComplete = () => {
    console.log("✅ Tous les assets sont chargés");
    setAssetsReady(true);
    // Petit délai pour l'animation de sortie du loader
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <BrowserRouter>
      <AudioPlayerProvider>
        {/* 🔥 LOADER CANVAS - Toujours monté pour précharger */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          zIndex: isLoading ? 9999 : -1,
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          pointerEvents: isLoading ? 'all' : 'none'
        }}>
          <Canvas>
            <PreloadAssets />
            <LoaderMain onLoadComplete={handleLoadComplete} />
            <Preload all />
          </Canvas>
        </div>

        {/* 🎨 CONTENU PRINCIPAL - Toujours monté mais caché */}
        <div style={{
          opacity: !isLoading ? 1 : 0,
          transition: 'opacity 0.5s ease-in',
          pointerEvents: !isLoading ? 'all' : 'none'
        }}>
          {/* Canvas papillon */}
          <Canvas
            id="papillon-canvas"
            shadows
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true }}
            camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 6] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none"
            }}
          >
            <Papillon />
          </Canvas>

          {/* Contenu de la page */}
          <div className="relative z-0 bg-primary">
            <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
              <Navbar />
              <Hero />
            </div>
            <About />
            <Experience />
            <Tech />
            <Works />
            <div className="relative z-0">
              <Contact />
              <StarsCanvas />
            </div>
          </div>
        </div>
      </AudioPlayerProvider>
    </BrowserRouter>
  );
};

export default App;
