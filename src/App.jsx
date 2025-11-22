import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain } from "./components";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import "./i18n";

// Composant qui précharge invisiblement tous les modèles 3D
const PreloadAssets = () => {
  useGLTF("/desktop_pc/scene.gltf");
  useGLTF("/spaceman/scene.gltf");
  return null;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <AudioPlayerProvider>
      <BrowserRouter>
        {isLoading ? (
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
              <PreloadAssets />
              <LoaderMain onLoadComplete={handleLoadComplete} />
              <Preload all />
            </Canvas>
          </div>
        ) : null}
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
    </AudioPlayerProvider>
  );
};

export default App;
