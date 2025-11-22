import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { fadeIn } from "../utils/motion";

const Tech = () => {
  return (
    <>
      {/* Affiche le composant pour les écrans de taille moyenne (md) et grands (lg), masque-le pour les petits écrans (jusqu'à md) */}
      <div className="hidden md:block lg:block">
        
        <div className="flex flex-row flex-wrap justify-center gap-10">
          {technologies.map((technology, index) => (
            <motion.div 
              className="w-28 h-28 group cursor-pointer" 
              key={technology.name}
              variants={fadeIn("up", "spring", index * 0.05, 0.75)}
            >
              {/* Vignette avec l'icône */}
              <div className="w-full h-full flex items-center justify-center bg-tertiary rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-opacity-80 relative overflow-hidden">
                {/* Effet glow au hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-300"></div>
                
                {/* Logo */}
                <img 
                  src={technology.icon} 
                  alt={technology.name}
                  className="w-16 h-16 object-contain relative z-10 filter group-hover:brightness-110 transition-all"
                  loading="lazy"
                />
              </div>
              

              <p className="text-center text-sm mt-3 text-secondary group-hover:text-white transition-colors font-medium">
                {technology.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Tech, "tech");
