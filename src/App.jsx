import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain, NebulaCanvas } from "./components";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
// import Papillon from "./components/canvas/Papillon"; // 1. Import DÉSACTIVÉ
import "./i18n";

// 🔥 PRÉCHARGE TOUS LES MODÈLES 3D
const PreloadAssets = () => {
  useGLTF.preload("/desktop_pc/scene.gltf");
  useGLTF.preload("/spaceman/scene.gltf");
  // useGLTF.preload("/papillon/source/vfs.glb"); // 2. Preload DÉSACTIVÉ
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
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <BrowserRouter>
      <AudioPlayerProvider>
        {/* 🔥 LOADER CANVAS */}
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
            <Canvas
              gl={{ alpha: true, preserveDrawingBuffer: true }}
              frameloop="demand"
              dpr={[1, 2]}
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: isLoading ? 9999 : -1 }}
            >
              <PreloadAssets />
              <LoaderMain onLoadComplete={handleLoadComplete} />
            </Canvas>
        </div>

        {/* 🎨 CONTENU PRINCIPAL */}
        <div style={{
          opacity: !isLoading ? 1 : 0,
          transition: 'opacity 0.5s ease-in',
          pointerEvents: !isLoading ? 'all' : 'none'
        }}>
          
          {/* 3. BLOC PAPILLON DÉSACTIVÉ POUR ÉVITER LE CRASH MOBILE */}
          {/* 
          🦋 Canvas papillon - Caché sur mobile (< md:768px), responsive sur desktop
          <Canvas
            id="papillon-canvas"
            className="hidden md:block fixed top-0 left-0 w-full h-full pointer-events-none scale-75 md:scale-90 lg:scale-100"
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
          */}

          {/* Contenu de la page */}
          <div className="relative z-0 bg-primary">
            {/* Header/Hero avec étoiles */}
            <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center relative">
              <Navbar />
              <Hero />
              <StarsCanvas />
            </div>
            
            {/* About avec étoiles */}
            <div className="relative">
              <About />
              <StarsCanvas />
            </div>
            
            {/* Experience avec nébuleuse (gaz + étoiles) - Déborde avec masque fondu */}
            <div className="relative" style={{ overflow: 'visible' }}>
              <Experience />
              {/* Nébuleuse qui déborde avec masque gradient */}
              <div style={{
                position: 'absolute',
                top: '-15vh',
                left: 0,
                width: '100%',
                height: 'calc(100% + 30vh)',
                zIndex: -1,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
              }}>
                <NebulaCanvas />
              </div>
            </div>
            
            {/* Tech avec étoiles */}
            <div className="relative">
              <Tech />
              <StarsCanvas />
            </div>
            
            {/* Works avec étoiles */}
            <div className="relative">
              <Works />
              <StarsCanvas />
            </div>
            
            {/* Contact avec étoiles */}
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
