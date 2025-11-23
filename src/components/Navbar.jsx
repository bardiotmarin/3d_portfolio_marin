import React, { useEffect, useState, useContext } from "react";
import LanguageSelector from "./LanguageSelector";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo, menu, close } from "../assets";
import { useTranslation } from "react-i18next";
import { AudioPlayerContext } from "../context/AudioPlayerContext";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [menuToggle, setMenuToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { isPlaying, toggle } = useContext(AudioPlayerContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const label = isPlaying ? t("stop_music") : t("play_music");

  return (
    <nav
      className={`${styles.paddingX} w-full flex items-center py-4 fixed top-0 z-20 ${
        scrolled ? "bg-primary" : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO (Gauche) */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
          <p className="text-white text-[18px] font-bold flex whitespace-nowrap">
            Marin&nbsp;<span className="sm:block hidden">| 3D Portfolio</span>
          </p>
        </div>

        {/* DESKTOP MENU (> 1024px) */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-10">
          <ul className="list-none flex flex-row gap-10">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`${
                  active === nav.id ? "text-white" : "text-secondary"
                } hover:text-white text-[18px] font-medium cursor-pointer transition-colors`}
                onClick={() => setActive(nav.id)}
              >
                <a href={`#${nav.id}`}>{t(nav.title)}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {/* BOUTON GROOVY DESKTOP */}
            <button
              onClick={() => toggle && toggle()}
              className={`
                relative overflow-hidden px-6 py-2 rounded-full text-white font-bold text-[16px] transition-all duration-300
                ${isPlaying ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse' : 'bg-transparent border border-white/20 hover:bg-white/10'}
              `}
            >
              <span className="relative z-10">{label}</span>
              {/* Effet de fond animé si playing */}
              {isPlaying && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-md animate-pulse"></div>
              )}
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* MOBILE & TABLETTE (< 1024px) */}
        <div className="lg:hidden flex flex-1 justify-end items-center gap-2 sm:gap-4">
          
          {/* BOUTON GROOVY MOBILE */}
          <button
            onClick={() => toggle && toggle()}
            className={`
              relative overflow-hidden rounded-full text-white font-bold transition-all duration-300
              text-[10px] px-2 py-1 sm:text-[14px] sm:px-4 sm:py-2 
              ${isPlaying ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' : 'bg-white/5 border border-white/20'}
            `}
          >
            <span className="relative z-10 whitespace-nowrap">{label}</span>
          </button>

          {/* Language Selector plus petit sur mobile */}
          <div className="scale-75 sm:scale-100 origin-right">
            <LanguageSelector />
          </div>

          {/* Burger */}
          <img
            src={menuToggle ? close : menu}
            alt="menu"
            className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] object-contain cursor-pointer ml-1"
            onClick={() => setMenuToggle(!menuToggle)}
          />

          {/* Menu Déroulant */}
          <div
            className={`${
              !menuToggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[180px] z-10 rounded-xl`}
          >
            <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
              {navLinks.map((nav) => (
                <li
                  key={nav.id}
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === nav.id ? "text-white" : "text-secondary"
                  }`}
                  onClick={() => {
                    setActive(nav.id);
                    setMenuToggle(!menuToggle);
                  }}
                >
                  <a href={`#${nav.id}`}>{t(nav.title)}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
