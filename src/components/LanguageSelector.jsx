// LanguageSelector.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <div>
      <label htmlFor="language-select">Select Language:</label>
      <select id="language-select" onChange={changeLanguage}>
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
