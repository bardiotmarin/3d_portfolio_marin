import React, { createContext, useState, useRef } from 'react';

const musicFiles = import.meta.glob('../assets/music/*.ogg', { eager: true });
const playlist = Object.values(musicFiles).map((module) => module.default);

console.log("🎵 Playlist chargée:", playlist.length, "fichiers");

export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioData, setAudioData] = useState({ analyser: null });
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  // ✅ Fonction async qui attend que l'audio soit prêt
  const initAudio = async () => {
    if (audioRef.current) return; // Déjà initialisé

    console.log("🎧 Initialisation audio player...");

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;

    const audio = new Audio(playlist[currentTrackIndex]);
    audio.crossOrigin = "anonymous";
    audio.loop = false;
    audioRef.current = audio;

    // Event listener pour passer à la suivante
    audio.addEventListener('ended', () => {
      nextTrack();
    });

    // Connecter l'audio à l'analyser
    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    setAudioData({ analyser });

    // ✅ ATTENDRE que l'audio soit prêt
    await new Promise((resolve) => {
      audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.load();
    });

    console.log("✅ Audio player prêt !");
  };

  const loadTrack = async (index) => {
    if (!audioRef.current) await initAudio();

    console.log(`🎵 Chargement piste ${index}:`, playlist[index]);
    
    audioRef.current.src = playlist[index];
    await audioRef.current.load();

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      console.log("▶️ Lecture démarrée");
    } catch (e) {
      console.error("❌ Erreur play:", e);
    }
  };

  const nextTrack = () => {
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= playlist.length) newIndex = 0;
    
    console.log("⏭️ Piste suivante");
    setCurrentTrackIndex(newIndex);
    loadTrack(newIndex);
  };

  const prevTrack = () => {
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) newIndex = playlist.length - 1;
    
    console.log("⏮️ Piste précédente");
    setCurrentTrackIndex(newIndex);
    loadTrack(newIndex);
  };

  const play = async () => {
    console.log("🎵 Tentative de lecture...");
    
    // ✅ ATTENDRE l'initialisation
    await initAudio();

    if (audioContextRef.current?.state === "suspended") {
      console.log("🔊 Reprise AudioContext...");
      await audioContextRef.current.resume();
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      console.log("✅ Lecture en cours !");
    } catch (e) {
      console.error("❌ Erreur lecture:", e);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      console.log("⏸️ Pause");
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    console.log("🔄 Toggle audio, isPlaying:", isPlaying);
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        isPlaying,
        audioData,
        toggle,
        play,
        stop,
        nextTrack,
        prevTrack,
        currentTrackIndex,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
