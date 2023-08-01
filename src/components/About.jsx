import React, { useEffect } from "react";
import Tilt from 'react-parallax-tilt';
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, titleKey, icon }) => {
    const { t } = useTranslation();

    return (
        <Tilt className="xs:w-[250px] w-full parallax-effect" perspective={300}>
            <motion.div
                variants={fadeIn("right", "spring", index * 0.5, 0.75)}
                className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
            >
                <div
                    options={{
                        max: 45,
                        scale: 1,
                        speed: 450,
                    }}
                    className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col "
                >
                    <img src={icon} alt="web-development" className="w-16 h-16 object-contain inner-element" />
                    <h3 className="text-white text-[20px] font-bold text-center inner-element">{t(titleKey)}</h3>
                </div>
            </motion.div>
        </Tilt>
    );
};

const About = () => {
    const { t, i18n } = useTranslation();

    // Refresh service cards when language changes
    useEffect(() => {
        // Change the language with an empty callback function to reload the resources
        i18n.changeLanguage(i18n.language, () => {});
    }, [i18n.language]);

    return (
        <>
            <div id="About"  > {/* Ajoutez l'ID "about" à cet élément */}
                <motion.div variants={textVariant()}>
                    <p className={styles.sectionSubText}>Introduction</p>
                    <h2 className={styles.sectionHeadText}>{t('overview')}</h2>
                </motion.div>

                <motion.p
                    variants={fadeIn("", "", 0.1, 1)}
                    className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
                >
                    {t("about_text")}
                </motion.p>
                <div className="mt-20 flex flex-wrap gap-10 ">
                    {services.map((service, index) => (
                        <ServiceCard key={service.title} index={index} titleKey={service.title} icon={service.icon} />
                    ))}
                </div>
            </div>
        </>
    );
};


export default SectionWrapper(About, "about");
