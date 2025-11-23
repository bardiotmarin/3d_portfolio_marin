import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain } from "./components";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import Papillon from "./components/canvas/Papillon";
import "./i18n";

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
  }, [isLoading]);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <BrowserRouter>
      <AudioPlayerProvider>
        {isLoading ? (
          <Canvas style={{ width: '100vw', height: '100vh' }}>
            <LoaderMain onLoadComplete={handleLoadComplete} />
          </Canvas>
        ) : null}
        
        {!isLoading && (
          <>
            {/* Canvas papillon - SANS z-index inline, géré par JS */}
            <Canvas
              id="papillon-canvas"
              className="papillon-canvas"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none"
                // PAS de zIndex ici, géré dynamiquement
              }}
              camera={{ position: [0, 0, 10], fov: 70 }}
            >
              <Papillon />
              <ambientLight intensity={0.5} />
            </Canvas>

            {/* Contenu */}
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

            <Canvas style={{ display: "none" }}>
              <PreloadAssets />
              <Preload all />
            </Canvas>
          </>
        )}
      </AudioPlayerProvider>
    </BrowserRouter>
  );
};

export default App;
