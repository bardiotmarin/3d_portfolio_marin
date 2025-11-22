import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Papillon = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/papillon/scene.gltf");
  const { actions, names } = useAnimations(animations, group);
  
  const [position, setPosition] = useState([0, 2, 0]);
  const [rotation, setRotation] = useState(0);
  const [currentAnim, setCurrentAnim] = useState("idle");
  const [keys, setKeys] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  
  // Touch controls
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  // Gestion des animations
  useEffect(() => {
    if (!actions) return;
    
    // Stop toutes les animations
    Object.values(actions).forEach(action => action.stop());
    
    // Joue l'animation courante avec transition
    const currentAction = actions[currentAnim];
    if (currentAction) {
      currentAction.reset().fadeIn(0.3).play();
    }
    
    return () => {
      if (currentAction) {
        currentAction.fadeOut(0.3);
      }
    };
  }, [currentAnim, actions]);

  // Détection clavier (PC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
      
      // Espace = take_off_and_land
      if (e.key === ' ') {
        setCurrentAnim('take_off_and_land');
        setTimeout(() => setCurrentAnim('idle'), 2000); // Retour idle après 2s
      }
    };
    
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Détection tactile (Mobile)
  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };
    
    const handleTouchMove = (e) => {
      if (!touchStart) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      setTouchDelta({ x: deltaX * 0.01, y: deltaY * 0.01 });
      setCurrentAnim('hover');
    };
    
    const handleTouchEnd = () => {
      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
      setTimeout(() => {
        if (!isMoving) setCurrentAnim('idle');
      }, 500);
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, isMoving]);

  // Logique de mouvement + animation (frame par frame)
  useFrame(() => {
    if (!group.current) return;
    
    const speed = keys.shift ? 0.15 : 0.08; // Rapide si Shift
    let dx = 0, dz = 0;
    
    // Clavier PC
    if (keys.w || keys.arrowup) dz -= speed;
    if (keys.s || keys.arrowdown) dz += speed;
    if (keys.a || keys.arrowleft) dx -= speed;
    if (keys.d || keys.arrowright) dx += speed;
    
    // Touch mobile
    if (touchDelta.x !== 0 || touchDelta.y !== 0) {
      dx += touchDelta.x;
      dz += touchDelta.y;
    }
    
    // Détection mouvement
    const moving = dx !== 0 || dz !== 0;
    setIsMoving(moving);
    
    // Mise à jour animation selon mouvement
    if (moving) {
      if (keys.shift) {
        setCurrentAnim('hover'); // Vol rapide
      } else {
        setCurrentAnim('hover'); // Vol normal
      }
    } else if (currentAnim !== 'take_off_and_land') {
      setCurrentAnim('idle'); // Statique
    }
    
    // Limites de déplacement (zone visible)
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    
    setPosition(prev => [
      clamp(prev[0] + dx, -8, 8),   // X
      prev[1],                       // Y (fixe)
      clamp(prev[2] + dz, -8, 8)    // Z
    ]);
    
    // Rotation vers direction de mouvement
    if (dx !== 0 || dz !== 0) {
      const targetRotation = Math.atan2(dx, dz);
      setRotation(targetRotation);
    }
    
    // Application smooth de la rotation
    group.current.rotation.y += (rotation - group.current.rotation.y) * 0.1;
  });

  return (
    <group ref={group} position={position}>
      <primitive object={scene} scale={1.5} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight position={[50, 10, 70]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
      <pointLight intensity={1} />
    </group>
  );
};

// Préchargement du modèle
useGLTF.preload("/papillon/scene.gltf");

export default Papillon;
