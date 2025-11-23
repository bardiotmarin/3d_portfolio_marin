import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

// ⌨️ Composant pour l'effet machine à écrire
const Typewriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayedText}</>;
};

const Papillon = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/papillon/source/vfs.glb");
  const { actions } = useAnimations(animations, group);
  const { viewport } = useThree();
  const { t } = useTranslation();

  // 💬 États pour les bulles
  const [message, setMessage] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messageStep, setMessageStep] = useState(0);

  // 🦋 Position bas-droite dynamique
  const getInitialPosition = () => {
    const rightEdge = viewport.width / 2 - 0.8;
    const bottomEdge = -viewport.height / 2 + 0.8;
    return [rightEdge, bottomEdge, 0];
  };

  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState(0);
  const [currentAnim, setCurrentAnim] = useState("idle");
  const [keys, setKeys] = useState({});
  const [flightState, setFlightState] = useState("ground");
  const [isBoosting, setIsBoosting] = useState(false);

  const idleTimeoutRef = useRef(null);

  const lastInputTime = useRef(Date.now());
  const lastRestTime = useRef(Date.now());
  const nextFlightDelay = useRef(3000 + Math.random() * 3000);
  const isAutoPilot = useRef(false);
  const flightPath = useRef(null);
  const waypoints = useRef([]);
  const currentWaypoint = useRef(0);
  
  // 🛑 Empêche le vol auto au tout début pour laisser lire
  const isStartupPhase = useRef(true);

  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  const targetPosition = useRef([0, 0, 0]);
  const currentPosition = useRef([0, 0, 0]);
  const isInitialized = useRef(false);

  const isMobile = useRef(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 1024
  );

  // 🎭 SCÉNARIO DES BULLES (Machine à écrire + Séquence)
  useEffect(() => {
  if (hasInteracted && messageStep > 0) {
    setMessage(null);
    return;
  }

  const messages = [
    t("butterfly_msg_1"),
    t("butterfly_msg_2"),
    t("butterfly_msg_3"),
    t("butterfly_msg_4"),
    t("butterfly_msg_5"),
    t("butterfly_msg_6"),
  ];

  let sequenceTimer;

  const runSequence = () => {
    if (messageStep >= messages.length) return;

    setMessage(messages[messageStep]);

    const readingTime = messageStep === 0 ? 5000 : 6000;

    sequenceTimer = setTimeout(() => {
      setMessage(null);

      const gapTime = 7000;
      sequenceTimer = setTimeout(() => {
        if (!hasInteracted) {
          setMessageStep((prev) => prev + 1);
        }
      }, gapTime);
    }, readingTime);
  };

  if (messageStep === 0 && !message) {
    sequenceTimer = setTimeout(runSequence, 1000);
  } else if (!message) {
    runSequence();
  }

  return () => clearTimeout(sequenceTimer);
}, [messageStep, hasInteracted, t, message]);



  // Désactive la phase de démarrage après 10 secondes (libère le papillon)
  useEffect(() => {
    const timer = setTimeout(() => {
      isStartupPhase.current = false;
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Init position
  useEffect(() => {
    if (viewport && !isInitialized.current) {
      const initialPos = getInitialPosition();
      targetPosition.current = initialPos;
      currentPosition.current = initialPos;
      setPosition(initialPos);
      isInitialized.current = true;
    }
  }, [viewport]);

  useEffect(() => {
    const handleResize = () => {
      isInitialized.current = false;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Z-index dynamique
  useEffect(() => {
    const updateZIndex = () => {
      const techSection = document.getElementById("tech");
      const experienceSection = document.getElementById("experience");
      const canvas = document.getElementById("papillon-canvas");

      if (!canvas) return;

      let newZIndex = 50;

      if (techSection) {
        const rect = techSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          newZIndex = 5;
        }
      }

      if (experienceSection) {
        const rect = experienceSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          newZIndex = 5;
        }
      }

      canvas.style.zIndex = newZIndex;
    };

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateZIndex();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Input détecte l'interaction et coupe la bulle
  const registerInput = () => {
  if (!hasInteracted) {
    setHasInteracted(true);
    setMessage(null); // Disparition immédiate
    if(messageStep === 0) {
      setMessageStep(1); // Passe au message 2 pour éviter replay boucle
    }
  }
  lastInputTime.current = Date.now();
  isAutoPilot.current = false;
  flightPath.current = null;
  waypoints.current = [];
  currentWaypoint.current = 0;
  isStartupPhase.current = false;
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
    action.timeScale = isBoosting ? 2.0 : 1.2;
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

      const sensitivity = isMobile.current ? 0.002 : 0.005;
      setTouchDelta({ x: deltaX * sensitivity, y: deltaY * sensitivity });
    };
    const handleTouchEnd = () => {
      registerInput();
      setIsBoosting(false);
      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
    };
    window.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStart, flightState]);

  const generateFlightPath = () => {
    const paths = [];
    const bottomRight = [viewport.width / 2 - 0.8, -viewport.height / 2 + 0.8];
    const bottomLeft = [-viewport.width / 2 + 0.8, -viewport.height / 2 + 0.8];
    const topRight = [viewport.width / 2 - 0.8, viewport.height / 2 - 0.8];
    const topLeft = [-viewport.width / 2 + 0.8, viewport.height / 2 - 0.8];
    const center = [0, 0];
    const topCenter = [0, viewport.height / 2 - 0.8];

    paths.push([topRight, bottomLeft]);
    paths.push([topLeft, bottomRight]);
    paths.push([topCenter, [-viewport.width / 4, 0], bottomLeft]);
    paths.push([topCenter, [viewport.width / 4, 0], bottomRight]);
    paths.push([topLeft, center, topRight, bottomRight]);
    paths.push([topRight, center, topLeft, bottomLeft]);
    paths.push([topRight, topCenter, topLeft, center, bottomLeft]);
    paths.push([topLeft, topCenter, topRight, center, bottomRight]);
    paths.push([topRight, center, bottomLeft]);
    paths.push([topLeft, center, bottomRight]);
    paths.push([center, topRight, bottomRight]);
    paths.push([center, topLeft, bottomLeft]);

    return paths[Math.floor(Math.random() * paths.length)];
  };

  useFrame((state) => {
    if (!group.current || !actions || !isInitialized.current) return;

    const timeSinceInput = Date.now() - lastInputTime.current;
    const timeSinceRest = Date.now() - lastRestTime.current;

    // ✅ CONDITION MODIFIÉE : Pas de vol auto pendant la phase de démarrage (lecture tuto)
    if (timeSinceInput > 3000 && !isAutoPilot.current && !isStartupPhase.current) {
      if (timeSinceRest > nextFlightDelay.current) {
        isAutoPilot.current = true;
        flightPath.current = generateFlightPath();
        waypoints.current = flightPath.current;
        currentWaypoint.current = 0;
        nextFlightDelay.current = 3000 + Math.random() * 3000;
      }
    }

    // ✅ VITESSE RÉDUITE
    const baseSpeed = isMobile.current ? 0.05 : 0.08; // Réduit de 0.08/0.12
    const boostFactor = isBoosting ? (isMobile.current ? 2.0 : 2.5) : 1.0;
    const speed = baseSpeed * boostFactor;
    let dx = 0,
      dy = 0;

    if (keys.a || keys.arrowleft) dx -= speed;
    if (keys.d || keys.arrowright) dx += speed;
    if (keys.w || keys.arrowup) dy += speed;
    if (keys.s || keys.arrowdown) dy -= speed;

    if (touchDelta.x !== 0 || touchDelta.y !== 0) {
      const touchMultiplier = isMobile.current ? 1.2 : 1.5;
      dx += touchDelta.x * touchMultiplier;
      dy -= touchDelta.y * touchMultiplier;
    }

    if (isAutoPilot.current && waypoints.current.length > 0) {
      if (currentWaypoint.current < waypoints.current.length) {
        const target = waypoints.current[currentWaypoint.current];
        const distX = target[0] - currentPosition.current[0];
        const distY = target[1] - currentPosition.current[1];
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance > 0.5) {
          const speedVar = 0.1 + Math.random() * 0.03;
          dx = (distX / distance) * speedVar;
          dy = (distY / distance) * speedVar;
          const oscillation =
            Math.sin(state.clock.elapsedTime * 3 + currentWaypoint.current) *
            0.02;
          dy += oscillation;
        } else {
          currentWaypoint.current++;
        }
      } else {
        dx = 0;
        dy = 0;
        isAutoPilot.current = false;
        setFlightState("ground");
        setCurrentAnim("idle");
        lastRestTime.current = Date.now();
        waypoints.current = [];
        currentWaypoint.current = 0;
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
      // On ne passe en idle que si on n'est pas en pilote auto et pas en phase de démarrage
      if (flightState === "air" && !idleTimeoutRef.current && !isAutoPilot.current) {
        idleTimeoutRef.current = setTimeout(() => {
          setFlightState("ground");
          setCurrentAnim("idle");
          idleTimeoutRef.current = null;
        }, 1000);
      }
    }

    let nextY = currentPosition.current[1] + dy;
    let nextX = currentPosition.current[0] + dx;

    const allowScroll = !isAutoPilot.current;

    if (allowScroll && dy !== 0) {
      const scrollAmount = dy * (isBoosting ? -45 : -35);
      if (Math.abs(scrollAmount) > 0.5) {
        window.scrollBy({ top: scrollAmount, behavior: "instant" });
      }
    }

    const limitLeft = -viewport.width / 2 + 0.6;
    const limitRight = viewport.width / 2 - 0.6;
    const limitTop = viewport.height / 2 - 0.6;
    const limitBottom = -viewport.height / 2 + 0.6;

    nextY = Math.max(limitBottom, Math.min(limitTop, nextY));
    nextX = Math.max(limitLeft, Math.min(limitRight, nextX));

    targetPosition.current = [nextX, nextY, targetPosition.current[2]];

    const lerpFactor = isMobile.current ? 0.25 : 0.35;
    currentPosition.current = [
      currentPosition.current[0] +
        (targetPosition.current[0] - currentPosition.current[0]) * lerpFactor,
      currentPosition.current[1] +
        (targetPosition.current[1] - currentPosition.current[1]) * lerpFactor,
      currentPosition.current[2] +
        (targetPosition.current[2] - currentPosition.current[2]) * lerpFactor,
    ];
    setPosition(currentPosition.current);

    // Rotation + comportement
    let targetRot = rotation;
    if (dx !== 0 || dy !== 0) {
      targetRot = Math.atan2(dx, dy);
      setRotation(targetRot);
    }

    if (message && messageStep < 5) {
      targetRot = Math.PI / 1.5;
    } else if (messageStep >= 5 && !hasInteracted) {
      targetRot = Math.PI * 1.2;
    }

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRot,
      0.2
    );
  });

  return (
    <group ref={group} position={position}>
      {message && (
        <Html
          position={[0, 0, 0]} // Centré sur le point de pivot
          center
          distanceFactor={15}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "20px",
              padding: "12px 18px",
              color: "white",
              fontSize: "13px",
              fontWeight: 500,
              textAlign: "center",
              width: "220px",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              position: "relative",
              whiteSpace: "normal",
              transform: "translateY(-100%) translateY(-20px)", // Remonte la bulle au-dessus
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            {/* Texte avec effet machine à écrire */}
            <Typewriter text={message} />
          </div>
        </Html>
      )}

      <primitive object={scene} scale={15} />

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

export default Papillon;
