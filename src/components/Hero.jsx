import { motion } from "framer-motion";
import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";
import { useTranslation } from "react-i18next";
import { useEffect } from "react"; // Import useEffect

const Hero = () => {
    const { t, i18n } = useTranslation();

    // Utilisez le hook useEffect pour forcer le composant à se mettre à jour lorsque la langue change
    useEffect(() => {
        // Empty dependency array to run only once (on mount) or you can add specific dependencies if needed
        // This will trigger a re-render when the language changes
    }, [i18n.language]);

    return (
        <section className={`relative w-full h-screen mx-auto`}>

            <ComputersCanvas                 className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
            />
            <div
                className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
            >
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



            <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
                <a href="#about">
                    <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
                        <motion.div
                            animate={{
                                y: [0, 24, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                            }}
                            className="w-3 h-3 rounded-full bg-secondary mb-1"
                        />
                    </div>
                </a>
            </div>
        </section>
    );
};

export default Hero;
