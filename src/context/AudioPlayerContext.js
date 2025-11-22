import React, { createContext, useRef, useState, useCallback } from "react";

// Context global audio pour synchroniser play/stop
export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialisation audio
  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/music/ECHO8.ogg");
      audioRef.current.loop = true;
    }
    return audioRef.current;
  };

  const play = useCallback(async () => {
    const audio = getAudio();
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setIsPlaying(false);
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ isPlaying, play, stop }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
