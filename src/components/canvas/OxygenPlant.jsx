import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const OxygenPlant = ({ scrollProgress }) => {
  const group = useRef();
  const { scene, animations } = useGLTF("/oxygen_plant/scene.gltf");
  const { actions, names } = useAnimations(animations, group);
  
  const [currentAnim, setCurrentAnim] = useState("closed");
  const [isInView, setIsInView] = useState(false);
  const hasOpened = useRef(false);

  console.log("🌿 OxygenPlant render - scrollProgress:", scrollProgress); // Debug

  // 🌿 Gestion des animations selon le scroll
  useEffect(() => {
    if (scrollProgress >= 0.3 && scrollProgress <= 0.6) {
      setIsInView(true);
      if (!hasOpened.current) {
        setCurrentAnim("open");
        hasOpened.current = true;
        
        setTimeout(() => {
          setCurrentAnim("opened");
        }, 2000);
      } else {
        setCurrentAnim("opened");
      }
    } else if (scrollProgress > 0.6) {
      setIsInView(false);
      setCurrentAnim("closed");
      hasOpened.current = false;
    } else {
      setIsInView(false);
      setCurrentAnim("closed");
    }
  }, [scrollProgress]);

  // 🎬 Jouer l'animation correspondante
  useEffect(() => {
    if (!actions || !names.length) {
      console.log("❌ Pas d'animations disponibles");
      return;
    }

    console.log("🎬 Animations disponibles:", names);
    console.log("🎯 Animation actuelle:", currentAnim);

    Object.values(actions).forEach((action) => {
      action.fadeOut(0.3);
    });

    const animMapping = {
      closed: "closed",
      open: "open", 
      opened: "opened"
    };

    const animName = animMapping[currentAnim];
    const action = actions[animName];

    if (action) {
      action.reset();
      action.fadeIn(0.3);
      action.play();
      
      if (currentAnim === "open") {
        action.setLoop(2200, 1);
      }
      console.log("✅ Animation jouée:", animName);
    } else {
      console.log("❌ Animation non trouvée:", animName);
    }
  }, [currentAnim, actions, names]);

  // 🎨 Rotation légère
  useFrame((state) => {
    if (group.current && isInView) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group 
      ref={group} 
      position={[0, 0, 0]}
      scale={150}  /* ✅ ÉNORME pour être visible */
    >
      <primitive object={scene} />
      
      {/* ✅ Lumières très fortes */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight intensity={2} position={[0, 5, 5]} />
      <pointLight intensity={1.5} position={[-5, 0, 0]} color="#32b8c6" />
    </group>
  );
};

export default OxygenPlant;

useGLTF.preload("/oxygen_plant/scene.gltf");
