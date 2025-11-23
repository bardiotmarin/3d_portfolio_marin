import { motion } from "framer-motion";
import { styles } from "../styles";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SpaceScene from "./canvas/SpaceScene";
import AudioVisualizer from "./canvas/playerAudio.jsx";
import { useState, useEffect } from "react";

const Hero = () => {
    const { t } = useTranslation();
    const [powerMode, setPowerMode] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") setPowerMode("LEFT");
            else if (e.key === "ArrowRight") setPowerMode("RIGHT");
            else setPowerMode(null);
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <section className="relative w-full h-screen mx-auto overflow-hidden">
            {/* Canvas 3D */}
            <Canvas
                shadows
                camera={{ position: [0, 0, 10], fov: 70 }}
                style={{
                  position: "absolute", 
                  zIndex: 0, 
                  width: '100vw', 
                  height: '100vh', 
                  top: 0, 
                  left: 0,
                  background: 'linear-gradient(to bottom, #000000, #0a0a1a)'
                }}
            >
                <SpaceScene />
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={false}
                  autoRotate={false} // ✅ Désactivé pour que le personnage ne tourne pas
                  autoRotateSpeed={0.3}
                  maxPolarAngle={Math.PI / 1.8} 
                  minPolarAngle={Math.PI / 2.5}
                />
            </Canvas>
            
            {/* Audio Visualizer - ✅ Descendu en CSS avec top */}
            <div 
                className="absolute inset-0 w-full h-full z-5 pointer-events-auto overflow-hidden"
                style={{ top: '100px' }} // ✅ Ajuste cette valeur pour descendre plus ou moins
            >
                <AudioVisualizer />
            </div>
            
            {/* Texte */}
            <div className={`absolute top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5  pointer-events-none`}>
                <div className="flex flex-col justify-center items-center mt-5">
                    <div className="w-5 h-5 rounded-full bg-[#915EFF]" />
                    <div className="w-1 sm:h-80 h-40 violet-gradient" />
                </div>
                <div>
                    <h1 className={`${styles.heroHeadText} futuristic-dark-violet-pink-text-gradient`}>
                        {t('hello')}, {t('iam')} <span className="text-[#915EFF]">Marin</span>
                    </h1>
                    <p className={`${styles.heroSubText} mt-2 text-white-100`}>
                        {t('i_develop')} <br className="sm:block hidden" />
                        {t('somes_interfaces')}
                    </p>
                </div>
            </div>
            
            {/* Scroll */}
            <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center  pointer-events-auto">
                <a href="#about">
                    <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
                        <motion.div
                            animate={{ y: [0, 24, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                            className="w-3 h-3 rounded-full bg-secondary mb-1"
                        />
                    </div>
                </a>
            </div>
        </section>
    );
};

export default Hero;
