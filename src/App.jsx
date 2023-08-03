import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas, LoaderMain } from "./components";
import "./i18n";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate the loading process for other components (replace this with your actual data loading logic)
    // For demonstration purposes, we use setTimeout to simulate loading for 3 seconds.
    setTimeout(() => {
      setIsLoading(false);
    }, 7000); // Example: wait for 3 seconds to simulate loading

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
    const canvases = document.getElementsByClassName("computer-canvas moon experience-work-container"); // Replace "your-canvas-class" with the actual class name of your canvas elements
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      canvas.addEventListener("load", onCanvasLoaded);
    }
    // Cleanup: Remove event listeners when the component unmounts
    return () => {
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        canvas.removeEventListener("load", onCanvasLoaded);
      }
    };
  }, []);

  return (
      <BrowserRouter>
        <div className="relative z-0 bg-primary">
          <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
            {isLoading ? <LoaderMain /> : null}
            {!isLoading && <Navbar />}
            {!isLoading && <Hero />}
          </div>
          {!isLoading && <About />}
          {!isLoading && <Experience />}
          {!isLoading && <Tech />}
          {!isLoading && <Works />}
          <div className="relative z-0">
            {!isLoading && <Contact />}
            {!isLoading && <StarsCanvas />}
          </div>
        </div>
      </BrowserRouter>
  );
};

export default App;
