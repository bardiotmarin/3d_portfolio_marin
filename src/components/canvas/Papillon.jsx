import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Papillon = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/papillon/source/vfs.glb");
  const { actions } = useAnimations(animations, group);

  const [position, setPosition] = useState([0, 2, 0]);
  const [rotation, setRotation] = useState(0);
  const [currentAnim, setCurrentAnim] = useState("idle");
  const [keys, setKeys] = useState({});
  const [flightState, setFlightState] = useState("ground");
  const [isBoosting, setIsBoosting] = useState(false);

  const idleTimeoutRef = useRef(null);
  const scrollAccumulator = useRef(0); // Pour lisser le scroll

  const lastInputTime = useRef(Date.now());
  const isAutoPilot = useRef(false);
  const hasReachedLeft = useRef(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  const targetPosition = useRef([0, 2, 0]);
  const currentPosition = useRef([0, 2, 0]);

  const isMobile = useRef(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 1024
  );

  // 🎯 Z-INDEX DYNAMIQUE CORRIGÉ
  useEffect(() => {
    const updateZIndex = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      const techSection = document.getElementById('tech');
      const experienceSection = document.getElementById('experience');
      const canvas = document.getElementById('papillon-canvas');
      
      if (!canvas) return;
      
      let newZIndex = 50; // Par défaut devant
      let inSpecialSection = false;
      
      // Détection Tech
      if (techSection) {
        const rect = techSection.getBoundingClientRect();
        const isVisible = rect.top < windowHeight && rect.bottom > 0;
        if (isVisible) {
          newZIndex = 5;
          inSpecialSection = true;
        }
      }
      
      // Détection Experience (prioritaire)
      if (experienceSection && !inSpecialSection) {
        const rect = experienceSection.getBoundingClientRect();
        const isVisible = rect.top < windowHeight && rect.bottom > 0;
        if (isVisible) {
          newZIndex = 5;
          inSpecialSection = true;
        }
      }
      
      canvas.style.zIndex = newZIndex;
    };
    
    // Throttle le scroll pour éviter les saccades
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateZIndex();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateZIndex();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const registerInput = () => {
    lastInputTime.current = Date.now();
    isAutoPilot.current = false;
    hasReachedLeft.current = false;
  };

  const hasMoveInput = () => {
    const k = keys;
    const keyMove =
      k.w ||
      k.a ||
      k.s ||
      k.d ||
      k.arrowup ||
      k.arrowdown ||
      k.arrowleft ||
      k.arrowright;
    const touchMove = touchDelta.x !== 0 || touchDelta.y !== 0;
    if (keyMove || touchMove) registerInput();
    return keyMove || touchMove;
  };

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => {
      if (a !== actions[currentAnim]) a.fadeOut(0.2);
    });
    const action = actions[currentAnim];
    if (!action) return;
    action.timeScale = isBoosting ? 3.5 : 1.8;
    action.reset().fadeIn(0.15).play();
  }, [currentAnim, actions, isBoosting]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      registerInput();
      const key = e.key.toLowerCase();
      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
          " ",
        ].includes(key)
      )
        e.preventDefault();
      if (key === " ") {
        if (flightState === "air") setIsBoosting(true);
      } else {
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === " ") setIsBoosting(false);
      else setKeys((prev) => ({ ...prev, [key]: false }));
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [flightState]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      registerInput();
      if (e.touches.length > 1) {
        setIsBoosting(true);
        return;
      }
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };
    const handleTouchMove = (e) => {
      registerInput();
      if (!touchStart) return;
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      const sensitivity = isMobile.current ? 0.003 : 0.01;
      setTouchDelta({ x: deltaX * sensitivity, y: deltaY * sensitivity });
    };
    const handleTouchEnd = () => {
      registerInput();
      setIsBoosting(false);
      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStart, flightState]);

  useFrame((state) => {
    if (!group.current) return;
    if (!actions) return;

    if (!hasMoveInput() && Date.now() - lastInputTime.current > 5000) {
      isAutoPilot.current = true;
    }

    const baseSpeed = isMobile.current ? 0.25 : 0.35;
    const boostFactor = isBoosting ? (isMobile.current ? 3.5 : 4.5) : 1.0;
    const speed = baseSpeed * boostFactor;
    let dx = 0,
      dy = 0;

    if (keys.a || keys.arrowleft) dx -= speed;
    if (keys.d || keys.arrowright) dx += speed;
    if (keys.w || keys.arrowup) dy += speed;
    if (keys.s || keys.arrowdown) dy -= speed;
    
    if (touchDelta.x !== 0 || touchDelta.y !== 0) {
      const touchMultiplier = isMobile.current ? 1.5 : boostFactor;
      dx += touchDelta.x * touchMultiplier;
      dy -= touchDelta.y * touchMultiplier;
    }

    if (isAutoPilot.current && !hasReachedLeft.current) {
      if (currentPosition.current[0] > -10) {
        dx = -0.15;
        dy = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      } else {
        dx = 0;
        dy = 0;
        hasReachedLeft.current = true;
      }
    }

    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      if (flightState === "ground") {
        setFlightState("air");
        setCurrentAnim("hover");
      } else if (currentAnim !== "hover") {
        setCurrentAnim("hover");
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    } else {
      if (flightState === "air" && !idleTimeoutRef.current) {
        idleTimeoutRef.current = setTimeout(() => {
          setFlightState("ground");
          setCurrentAnim("idle");
          idleTimeoutRef.current = null;
        }, 3000);
      }
    }

    let nextY = currentPosition.current[1] + dy;
    let nextX = currentPosition.current[0] + dx;
    
    const scrollTriggerTop = 1.0;
    const scrollTriggerBottom = -1.0;
    
    // SCROLL PROGRESSIF ET LISSÉ
    const baseScrollSpeed = isBoosting ? 3.0 : 2.0;
    const allowScroll = !isAutoPilot.current;
    
    if (allowScroll) {
      // Accumule le dépassement
      if (nextY < scrollTriggerBottom && dy < 0) {
        scrollAccumulator.current += (scrollTriggerBottom - nextY) * baseScrollSpeed * 10;
        nextY = scrollTriggerBottom;
      } else if (nextY > scrollTriggerTop && dy > 0) {
        scrollAccumulator.current -= (nextY - scrollTriggerTop) * baseScrollSpeed * 10;
        nextY = scrollTriggerTop;
      }
      
      // Applique le scroll progressivement
      if (Math.abs(scrollAccumulator.current) > 0.5) {
        const scrollAmount = scrollAccumulator.current * 0.3; // 30% par frame
        window.scrollBy({ top: scrollAmount, behavior: 'auto' });
        scrollAccumulator.current *= 0.7; // Decay
      }
    }
    
    const limitLeft = isMobile.current ? -10 : -15;
    const limitRight = isMobile.current ? 10 : 15;
    const limitTop = 2.5;
    const limitBottom = -2.5;
    
    nextY = Math.max(limitBottom, Math.min(limitTop, nextY));
    nextX = Math.max(limitLeft, Math.min(limitRight, nextX));

    targetPosition.current = [nextX, nextY, targetPosition.current[2]];
    
    const lerpFactor = isMobile.current ? 0.4 : 0.6;
    currentPosition.current = [
      currentPosition.current[0] +
        (targetPosition.current[0] - currentPosition.current[0]) * lerpFactor,
      currentPosition.current[1] +
        (targetPosition.current[1] - currentPosition.current[1]) * lerpFactor,
      currentPosition.current[2] +
        (targetPosition.current[2] - currentPosition.current[2]) * lerpFactor,
    ];
    setPosition(currentPosition.current);

    if (isAutoPilot.current && hasReachedLeft.current) {
      const targetRot = Math.PI / 2;
      group.current.rotation.y +=
        (targetRot - group.current.rotation.y) * 0.25;
    } else if (dx !== 0 || dy !== 0) {
      const targetRot = Math.atan2(dx, dy);
      setRotation(targetRot);
      group.current.rotation.y +=
        (rotation - group.current.rotation.y) * 0.35;
    }
  });

  return (
    <group ref={group} position={position}>
      <primitive object={scene} scale={35} />
      <hemisphereLight intensity={0.2} groundColor="black" />
      <spotLight
        position={[50, 10, 70]}
        angle={0.12}
        penumbra={1}
        intensity={1.2}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1.5} />
    </group>
  );
};

useGLTF.preload("/papillon/source/vfs.glb");
export default Papillon;
