import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo, menu, close } from "../assets";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    // Ajouter l'événement de scroll
    window.addEventListener("scroll", handleScroll);

    // Nettoyer l'événement lorsque le composant se démonte
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
      <nav
          className={`${
              styles.paddingX
          } w-full flex items-center py-5 fixed top-0 z-20 ${
              scrolled ? "bg-primary" : "bg-transparent"
          }`}
      >
        <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
          <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
          >
            <img src={logo} alt="logo" className="w-9 h-9 object-contain" />
            <p className="text-white text-[18px] font-bold cursor-pointer flex ">
              Marin &nbsp;
              <span className="sm:block hidden"> | 3D Portfolio</span>
            </p>
          </Link>
          <LanguageSelector />
          <div className="hidden sm:flex items-center">
            <ul className="list-none flex flex-row gap-10">
              {navLinks.map((nav) => (
                  <li
                      key={nav.id}
                      className={`${
                          active === nav.id ? "text-white" : "text-secondary"
                      } hover:text-white text-[18px] font-medium cursor-pointer`}
                  >
                    {/* Utiliser le composant Link de React Router */}
                    <Link
                        to={`#${nav.id}`}
                        onClick={() => setActive(nav.id)} // Définir le lien actif au clic
                    >
                      {t(nav.title)}
                    </Link>
                  </li>
              ))}
            </ul>
          </div>

          <div className="sm:hidden flex items-center">
            <img
                src={toggle ? close : menu}
                alt="menu"
                className="w-[28px] h-[28px] object-contain"
                onClick={() => setToggle(!toggle)}
            />

            <div
                className={`${
                    !toggle ? "hidden" : "flex"
                } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
            >
              <LanguageSelector />
              <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
                {navLinks.map((nav) => (
                    <li
                        key={nav.id}
                        className={`font-poppins font-medium cursor-pointer text-[16px] ${
                            active === nav.id ? "text-white" : "text-secondary"
                        }`}
                        onClick={() => {
                          setToggle(!toggle);
                        }}
                    >
                      {/* Utiliser le composant Link de React Router */}
                      <Link to={`#${nav.id}`}>{t(nav.title)}</Link>
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
