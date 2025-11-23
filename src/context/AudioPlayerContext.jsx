import React, { createContext, useState, useRef, useEffect } from 'react';

// ✅ 1. IMPORT AUTOMATIQUE DE TOUS LES FICHIERS DU DOSSIER
// Cela crée un objet avec tous les fichiers trouvés
const musicFiles = import.meta.glob('../assets/music/*.ogg', { eager: true });

// On transforme cet objet en tableau d'URLs (playlist)
const playlist = Object.values(musicFiles).map((module) => module.default);

export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // ✅ Suivre la piste actuelle
  const [audioData, setAudioData] = useState({ analyser: null });
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  const initAudio = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;

      // ✅ On initialise avec la première musique de la playlist
      const audio = new Audio(playlist[currentTrackIndex]);
      audio.crossOrigin = "anonymous";
      audio.loop = false; // ❌ Désactivé pour permettre de passer à la suivante
      audioRef.current = audio;

      // ✅ Détection de fin de morceau pour jouer le suivant
      audio.addEventListener('ended', () => {
        nextTrack();
      });

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      setAudioData({ analyser });
    }
  };

  // ✅ Fonction pour changer de piste
  const loadTrack = async (index) => {
    if (!audioRef.current) initAudio();
    
    // Met à jour la source
    audioRef.current.src = playlist[index];
    audioRef.current.load();
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) { console.error(e); }
  };

  // ✅ Passer à la suivante
  const nextTrack = () => {
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= playlist.length) {
      newIndex = 0; // Retour au début si fin de playlist
    }
    setCurrentTrackIndex(newIndex);
    loadTrack(newIndex);
  };

  // ✅ Passer à la précédente
  const prevTrack = () => {
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) {
      newIndex = playlist.length - 1; // Va à la dernière si on recule au début
    }
    setCurrentTrackIndex(newIndex);
    loadTrack(newIndex);
  };

  const play = async () => {
    if (!audioRef.current) initAudio();
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) { console.error(e); }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    if (isPlaying) stop();
    else play();
  };

  return (
    <AudioPlayerContext.Provider value={{ 
      isPlaying, 
      play, 
      stop, 
      toggle, 
      audioData, 
      nextTrack, // ✅ Tu peux utiliser ça dans tes composants si tu veux des boutons Next/Prev
      prevTrack 
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
