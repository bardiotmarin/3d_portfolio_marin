import React from "react";
import i18next from "i18next";

const LanguageSelector = () => {
  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18next.changeLanguage(selectedLanguage);
  };

  return (
    <select
      className="text-white font-medium cursor-pointer bg-transparent border-none outline-none appearance-none"
      onChange={changeLanguage}
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
      {/* Ajoutez d'autres options pour chaque langue prise en charge */}
    </select>
  );
};

export default LanguageSelector;
