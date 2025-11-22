import React, { useEffect, useState } from "react";
import  LanguageSelector from "./LanguageSelector";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo, menu, close } from "../assets";
import { useTranslation } from "react-i18next";

// Music player logic moved here
const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/music/ECHO8.ogg");
      audioRef.current.loop = true;
    }
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  return { isPlaying, togglePlay };
};

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { isPlaying, togglePlay } = useMusicPlayer();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <nav className={`${styles.paddingX} w-full flex items-center py-5 fixed top-0 z-20 ${scrolled ? "bg-primary" : "bg-transparent"}`}>        <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
          <a
              href="/"
              className="flex items-center gap-2"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
          >
            <img src={logo} alt="logo" className="w-13 h-12 object-contain" />
            <p className="text-white text-[18px] font-bold cursor-pointer flex ">
              Marin &nbsp;
              <span className="sm:block hidden"> | 3D Portfolio</span>
            </p>
          </a>
          <div className=" sm:ml-14 ml-10">
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-4">
            {/* Play/Stop Music button now in navbar */}
            <button 
              onClick={togglePlay}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-xs cursor-pointer"
            >
              {isPlaying ? "Stop Music" : "Play Music"}
            </button>
            <div className="hidden sm:flex items-center">
              <ul className="list-none flex flex-row gap-10">
                {navLinks.map((nav) => (
                    <li
                        key={nav.id}
                        className={`${active === nav.id ? "text-white" : "text-secondary"} hover:text-white text-[18px] font-medium cursor-pointer`}
                    >
                      <a
                          href={`#${nav.id}`}
                          onClick={() => setActive(nav.id)}
                      >
                        {t(nav.title)}
                      </a>
                    </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <img
                src={toggle ? close : menu}
                alt="menu"
                className="w-[28px] h-[28px] object-contain"
                onClick={() => setToggle(!toggle)}
            />
            <div
                className={`${!toggle ? "hidden" : "flex"} p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
            >
              <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
                {navLinks.map((nav) => (
                    <li
                        key={nav.id}
                        className={`font-poppins font-medium cursor-pointer text-[16px] ${active === nav.id ? "text-white" : "text-secondary"}`}
                        onClick={() => {
                          setToggle(!toggle);
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
