import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

// ✅ Import automatique de TOUS les fichiers .ogg du dossier
const audioModules = import.meta.glob('../../assets/sample_papillon/*.ogg', { eager: true });
const audioSamples = Object.values(audioModules).map(module => module.default);

console.log("🎵 Samples audio chargés:", audioSamples.length, audioSamples);

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

  return <span>{displayedText || "\u00A0"}</span>;
};

const Papillon = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/papillon/source/vfs.glb");
  const { actions } = useAnimations(animations, group);
  const { viewport } = useThree();
  const { t, i18n } = useTranslation();

  // 💬 États pour les bulles
  const [message, setMessage] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messageStep, setMessageStep] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  // 🔊 Audio state et refs
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // ✅ NOUVEAU : Tracker les samples déjà joués
  const playedSamples = useRef(new Set());

  // 🦋 Position bas-droite dynamique
  // 🦋 Position bas-GAUCHE dynamique (modification ligne ~82)
  const getInitialPosition = () => {
    const leftEdge = -viewport.width / 2 + 0.8; // ✅ Changé de rightEdge à leftEdge
    const bottomEdge = -viewport.height / 2 + 0.8;
    return [leftEdge, bottomEdge, 0]; // ✅ Utilise leftEdge au lieu de rightEdge
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

  // 🔊 Fonction pour jouer un sample VRAIMENT aléatoire
  const playRandomSample = () => {
    console.log("🦋 CLIC DÉTECTÉ !");
    console.log(`📂 ${audioSamples.length} samples disponibles`);
    
    if (audioSamples.length === 0) {
      console.error("❌ Aucun fichier audio trouvé !");
      return;
    }

    // Si un audio est déjà en cours, on l'arrête
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // ✅ Si tous les samples ont été joués, on reset
    if (playedSamples.current.size >= audioSamples.length) {
      console.log("🔄 Tous les samples joués, reset !");
      playedSamples.current.clear();
    }

    // ✅ Sélectionner un sample qui n'a pas encore été joué
    let selectedSample;
    let randomIndex;
    let attempts = 0;
    const maxAttempts = 50; // Éviter une boucle infinie

    do {
      randomIndex = Math.floor(Math.random() * audioSamples.length);
      selectedSample = audioSamples[randomIndex];
      attempts++;
    } while (playedSamples.current.has(selectedSample) && attempts < maxAttempts);

    // Marquer ce sample comme joué
    playedSamples.current.add(selectedSample);

    console.log(`🎵 Sample #${randomIndex} sélectionné (${playedSamples.current.size}/${audioSamples.length} joués)`);
    console.log("🎧 URL:", selectedSample);

    // Créer et jouer le nouvel audio
    const audio = new Audio(selectedSample);
    audioRef.current = audio;

    audio.volume = 0.7;
    
    audio.play()
      .then(() => {
        setIsPlaying(true);
        console.log("✅ Audio EN LECTURE");
      })
      .catch(error => {
        console.error("❌ ERREUR lecture audio:", error);
      });

    audio.onended = () => {
      setIsPlaying(false);
      console.log("✅ Audio terminé");
    };
  };

  // ✅ Fonction pour obtenir les messages traduits
  const getMessages = () => [
    t("butterfly_msg_1"),
    t("butterfly_msg_2"),
    t("butterfly_msg_3"),
    t("butterfly_msg_4"),
    t("butterfly_msg_5"),
    t("butterfly_msg_6"),
  ];

  // ✅ Met à jour SEULEMENT le texte du message quand la langue change
  useEffect(() => {
    if (isMessageVisible && messageStep >= 0) {
      const messages = getMessages();
      if (messages[messageStep]) {
        setMessage(messages[messageStep]);
      }
    }
  }, [i18n.language]);

  // 🎭 SCÉNARIO DES BULLES - VERSION CORRIGÉE
  useEffect(() => {
    // ✅ Si l'utilisateur a interagi, on arrête tout après le message 1
    if (hasInteracted && messageStep > 0) {
      setIsMessageVisible(false);
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

      // Afficher le message
      setIsMessageVisible(true);
      setMessage(messages[messageStep]);

      // ✅ Durée d'affichage : 4s pour le premier, 6s pour les autres
      const readingTime = messageStep === 0 ? 4000 : 6000;

      // ✅ Timer pour cacher le message
      sequenceTimer = setTimeout(() => {
        setIsMessageVisible(false);
        setMessage(null);

        // ✅ Attendre 7s avant de passer au suivant
        const gapTimer = setTimeout(() => {
          if (!hasInteracted) {
            setMessageStep((prev) => prev + 1);
          }
        }, 7000);

        // ✅ IMPORTANT : Retourner le cleanup du gapTimer aussi
        return () => clearTimeout(gapTimer);
      }, readingTime);
    };

    // ✅ Démarrage de la séquence
    if (messageStep === 0 && !isMessageVisible) {
      // Premier message après 5 secondes
      sequenceTimer = setTimeout(runSequence, 5000);
    } else if (messageStep > 0 && !isMessageVisible && !hasInteracted) {
      // Messages suivants démarrent immédiatement
      runSequence();
    }

    return () => {
      if (sequenceTimer) clearTimeout(sequenceTimer);
    };
  }, [messageStep, hasInteracted, isMessageVisible, t, i18n.language]);


  // Désactive la phase de démarrage après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      isStartupPhase.current = false;
    }, 16000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup audio au démontage du composant
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
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

  const registerInput = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsMessageVisible(false);
      setMessage(null);
      if (messageStep === 0) {
        setMessageStep(1);
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

    if (timeSinceInput > 3000 && !isAutoPilot.current && !isStartupPhase.current) {
      if (timeSinceRest > nextFlightDelay.current) {
        isAutoPilot.current = true;
        flightPath.current = generateFlightPath();
        waypoints.current = flightPath.current;
        currentWaypoint.current = 0;
        nextFlightDelay.current = 3000 + Math.random() * 3000;
      }
    }

    const baseSpeed = isMobile.current ? 0.05 : 0.08;
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

    let targetRot = rotation;
    if (dx !== 0 || dy !== 0) {
      targetRot = Math.atan2(dx, dy);
      setRotation(targetRot);
    }

    if (isMessageVisible && messageStep < 5) {
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
    {message && isMessageVisible && (
  <Html
    position={[0, 0, 0]} // On reste ancré sur le papillon
    center // Le centrage de base, qu'on va surcharger avec le CSS
    distanceFactor={15}
    zIndexRange={[100, 0]}
    style={{ pointerEvents: "none" }}
  >
    {/* Conteneur de la bulle */}
    <div
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "16px",
        padding: "10px 14px",
        color: "white",
        fontSize: "9px",
        fontWeight: 500,
        textAlign: "left",
        width: "200px",
        maxWidth: "200px",
        boxShadow: "0 6px 24px 0 rgba(31, 38, 135, 0.3)",
        position: "relative",
        whiteSpace: "pre-line",
        wordBreak: "break-word",
        lineHeight: "1.5",

        // 👇 LOGIQUE DE POSITIONNEMENT INTELLIGENTE 👇
        transform: `
          translateX(${
            // Si on est trop à gauche (< bord gauche + marge) -> On aligne à 0% (vers la droite)
            position[0] < -viewport.width / 2 + 3 ? "10%" : 
            // Si on est trop à droite (> bord droit - marge) -> On aligne à -100% (vers la gauche)
            position[0] > viewport.width / 2 - 3 ? "-110%" : 
            // Sinon -> Centré
            "-50%"
          }) 
          translateY(${
            // Si on est trop haut (> bord haut - marge) -> On affiche EN DESSOUS (+20px)
            position[1] > viewport.height / 2 - 3 ? "40px" : 
            // Sinon -> Au dessus (-100% - marge)
            "calc(-100% - 20px)"
          })
        `,
        transition: "transform 0.2s ease-out" // Animation fluide du déplacement
      }}
    >
      {/* La petite flèche (triangle) */}
      <div
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          
          // 👇 Inversion de la flèche si la bulle est en dessous 👇
          borderTop: position[1] > viewport.height / 2 - 3 ? "none" : "6px solid rgba(255, 255, 255, 0.2)",
          borderBottom: position[1] > viewport.height / 2 - 3 ? "6px solid rgba(255, 255, 255, 0.2)" : "none",

          // 👇 Positionnement de la flèche pour suivre le papillon 👇
          top: position[1] > viewport.height / 2 - 3 ? "-6px" : "auto",
          bottom: position[1] > viewport.height / 2 - 3 ? "auto" : "-6px",
          
          left: 
            position[0] < -viewport.width / 2 + 3 ? "20px" : // Flèche à gauche
            position[0] > viewport.width / 2 - 3 ? "calc(100% - 20px)" : // Flèche à droite
            "50%", // Flèche au centre
            
          transform: "translateX(-50%)",
          transition: "all 0.2s ease-out"
        }}
      />
      <Typewriter text={message} />
    </div>
  </Html>
)}

    
    {/* ✅ Zone cliquable en HTML qui traverse le pointerEvents: none du Canvas */}
    <Html
      position={[0, 0, 0]}
      center
      zIndexRange={[100, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          playRandomSample();
        }}
        onMouseEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}
        style={{
          width: '120px',  // Ajuste selon tes besoins
          height: '120px', // Ajuste selon tes besoins
          borderRadius: '50%',
          cursor: 'pointer',
          // background: 'rgba(255, 0, 0, 0.2)', // ✅ DEBUG: Décommente pour voir la zone
        }}
      />
    </Html>

    {/* Le papillon 3D */}
    <primitive object={scene} scale={8} />
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
