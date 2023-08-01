import React from "react";
import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

const Tech = () => {
    return (
        <>
            {/* Affiche le composant pour les écrans de taille moyenne (md) et grands (lg), masque-le pour les petits écrans (jusqu'à md) */}
            <div className="hidden md:block lg:block">
                <div className="flex flex-row flex-wrap justify-center gap-10">
                    {technologies.map((technology) => (
                        <div className="w-28 h-28" key={technology.name}>
                            <BallCanvas icon={technology.icon} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SectionWrapper(Tech, "tech");

