import { motion } from "framer-motion";
import { styles } from "../styles";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { MewCanvas } from "./canvas";
import AudioVisualizer from "./canvas/playerAudio.jsx";
import MoonHero from "./canvas/Moon.jsx";

const Hero = () => {
    const { t, i18n } = useTranslation();

    return (
        <section className="relative w-full h-screen mx-auto overflow-hidden">
            {/* Placement 3D canvas : tout dans le même Canvas R3F pour overlay/fond moon/mew */}
            <Canvas
                style={{ position: "absolute", zIndex: 0, width: '100vw', height: '100vh', top: 0, left: 0 }}
                shadows
                camera={{ position: [0, 0, 10], fov: 70 }}
            >
                {/* FOND LUNE (MoonHero) */}
                <MoonHero />
                {/* MEW devant (MewCanvas) */}
                <MewCanvas />
                {/* Effets visuels audio (peut être transformé en objets 3D si souhaité) */}
                {/* <AudioVisualizer /> */}
            </Canvas>
            {/* 2. AUDIO VISUALIZER (fond effet visuel html/canvas quand non 3D) */}
            <div className="absolute inset-0 w-full h-full z-5 pointer-events-auto">
                <AudioVisualizer />
            </div>
            {/* 3. TEXTE + Scroll */}
            <div className={`absolute top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5 z-20 pointer-events-none`}>
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
            {/* SCROLL */}
            <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center z-20 pointer-events-auto">
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
