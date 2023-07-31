import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { motion } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";
import about from "./About.jsx";

const ExperienceCard = ({ experience }) => {
    const { t } = useTranslation();

    return (
        <VerticalTimelineElement
            contentStyle={{
                background: "#1d1836",
                color: "#fff",
            }}
            contentArrowStyle={{ borderRight: "7px solid #232631" }}
            date={t(experience.date)}
            iconStyle={{ background: experience.iconBg }}
            icon={
                <div className="flex justify-center items-center w-full h-full">
                    <img
                        src={experience.icon}
                        alt={experience.company_name}
                        className="w-[60%] h-[60%] object-contain"
                    />
                </div>
            }
        >

            <div>

                <h3 className="text-white text-[24px] font-bold">{t(experience.title)}</h3>
                <p className="text-secondary text-[16px] font-semibold" style={{ margin: 0 }}>
                    {t(experience.company_name)}
                </p>
            </div>

            <ul className="mt-5 list-disc ml-5 space-y-2">

                {experience.points.map((point, index) => (
                    <li key={`experience-point-${index}`} className="text-white-500 text-[14px] pl-1 tracking-wider">
                        {t(point)} {/* Utilisez la clé de traduction pour obtenir le texte traduit */}
                        {experience.subPoints && experience.subPoints[index] && experience.subPoints[index].length > 0 && (
                            <ul className="ml-5 list-disc space-y-2">
                                {experience.subPoints[index].map((subPoint, subIndex) => (
                                    <li
                                        key={`experience-subpoint-${subIndex}`}
                                        className="text-white-100 text-[14px] pl-1 tracking-wider"
                                    >
                                        {t(subPoint)} {/* Utilisez la clé de traduction pour obtenir le texte traduit */}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

        </VerticalTimelineElement>
    );
};

const Experience = () => {
    const { t, i18n } = useTranslation();

    // Rafraîchir les cartes de service lorsque la langue change
    useEffect(() => {
        // Changer la langue avec une fonction de rappel vide pour recharger les ressources
        i18n.changeLanguage(i18n.language, () => {});
    }, [i18n.language]);

    return (
        <>
            <motion.div variants={textVariant()}>
                <p className={styles.sectionSubText}>{t("what_i_have_done")}</p>
                <h2 className={styles.sectionHeadText}>{t("professional_experience")}</h2>
            </motion.div>

            <div className="mt-20 flex flex-col">
                <VerticalTimeline>
                    {experiences.map((experience, index) => (
                        <ExperienceCard key={index} experience={experience} />
                    ))}
                </VerticalTimeline>
            </div>

        </>
    );
};

export default SectionWrapper(Experience, "work");
