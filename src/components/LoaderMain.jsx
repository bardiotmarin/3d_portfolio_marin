import React, { useState, useEffect } from 'react';
import { Html, useProgress } from "@react-three/drei";

const LoaderMain = ({ onLoadComplete }) => {
  const { progress, loaded, total } = useProgress();
  const [loadingText, setLoadingText] = useState('Loading Some Spices...');
  const [hasCompleted, setHasCompleted] = useState(false);

  const loadingTextOptions = [
    'Unleashing the Power of 3D Stardust...',
    'Mastering the Art of Interstellar Loading...',
    'Summoning the Force of Galactic Creativity...',
    'Embarking on a Cosmic Journey of Imagination...',
    'Conquering Loading Lag with Space-age Tech...',
    'Blazing Trails through the 3D Universe...',
    'Syncing Pixels with Celestial Frequencies...',
    'Venturing Beyond the Event Horizon of Design...',
    'Accelerating Through Cosmic Code Paths...',
    'Transcending Dimensions for 3D Awesomeness...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prevText) => {
        const currentIndex = loadingTextOptions.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingTextOptions.length;
        return loadingTextOptions[nextIndex];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Détection améliorée de la fin du chargement
  useEffect(() => {
    // Vérifier que le progrès est à 100 ET que tous les items sont chargés
    if (progress >= 100 && loaded === total && !hasCompleted) {
      console.log(`✅ Chargement terminé: ${loaded}/${total} assets`);
      setHasCompleted(true);
      
      setTimeout(() => {
        if (onLoadComplete) {
          onLoadComplete();
        }
      }, 500);
    }
  }, [progress, loaded, total, onLoadComplete, hasCompleted]);

  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Barre de progression */}
        <div style={{
          width: '300px',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#915eff',
            transition: 'width 0.3s ease',
            borderRadius: '4px'
          }} />
        </div>

        {/* Pourcentage */}
        <p style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          {progress.toFixed(0)}%
        </p>

        {/* Texte animé */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          {loadingText}
        </p>

        {/* Debug info (optionnel, à retirer en prod) */}
        <p style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
          marginTop: '10px'
        }}>
          {loaded} / {total} assets
        </p>
      </div>
    </Html>
  );
};

export default LoaderMain;
