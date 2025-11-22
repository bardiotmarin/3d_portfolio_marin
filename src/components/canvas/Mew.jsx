import React, { useEffect, useState } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Mew = ({ powerMode }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  let scale, positionX, positionY;
  const qhdResolution = 2560, fhdResolution = 1920, laptopResolution = 1440, tabletResolution = 768, is4KScreen = screenWidth >= 3840;
  if (is4KScreen) { scale = 0.222; positionX = 2; positionY = 2; } 
  else if (screenWidth >= qhdResolution) { scale = 0.084; positionX = -2; positionY = -0.6; }
  else if (screenWidth >= fhdResolution) { scale = 0.056; positionX = -2; positionY = -2; }
  else if (screenWidth >= laptopResolution) { scale = 0.060; positionX = 1.5; positionY = -1; }
  else if (screenWidth >= tabletResolution) { scale = 0.050; positionX = -1.41; positionY = -0.8; }
  else if (screenWidth < 500) { scale = 0.030; positionX = -1.5; positionY = -1; }
  else { scale = 0.0022; positionX = 0; positionY = -1; }

  const gltf = useGLTF("/desktop_pc/scene.gltf");

  // Animation d'effet selon powerMode
  const [color, setColor] = useState("white");
  useEffect(() => {
    if(powerMode === "LEFT") setColor("#ff2e7a");
    else if(powerMode === "RIGHT") setColor("#00abff");
    else setColor("white");
  }, [powerMode]);

  // Patch: Itère sur tous les meshes enfants pour setter le material.color (R3F-safe)
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    gltf.scene.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.emissive) {
        if (powerMode === "LEFT") obj.material.emissive.set("#ff2e7a");
        else if (powerMode === "RIGHT") obj.material.emissive.set("#00abff");
        else obj.material.emissive.set("#000000");
      }
    });
  }, [powerMode, gltf]);
  return (
    <group>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight position={[50, 10, 70]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
      <pointLight intensity={1} />
      <primitive object={gltf.scene} scale={scale} position={[positionX, positionY, 0]} rotation={[-0.11, -5.0, -0.10]} />
      <OrbitControls enablePan={false} autoRotate={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
    </group>
  );
};

export default Mew;
