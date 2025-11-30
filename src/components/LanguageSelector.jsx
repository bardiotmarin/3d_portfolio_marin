import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <select
      className="text-white font-medium cursor-pointer bg-transparent border border-white/30 rounded px-3 py-2 outline-none hover:border-white/60 transition-all"
      onChange={changeLanguage}
      value={i18n.language}
      style={{ pointerEvents: 'auto' }}
    >
      <option value="en" className="bg-gray-900 text-white">
        {t("EN")}
      </option>
      <option value="fr" className="bg-gray-900 text-white">
        {t("FR")}
      </option>
    </select>
  );
};

export default LanguageSelector;
