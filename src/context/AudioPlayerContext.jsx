import React, { createContext, useRef, useState, useCallback } from "react";

export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  // Always ensure audioRef.current stays the same instance
  if (!audioRef.current) {
    audioRef.current = new Audio("/assets/music/ECHO8.ogg");
    audioRef.current.loop = true;
  }

  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ isPlaying, play, stop, audioElement: audioRef.current }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
