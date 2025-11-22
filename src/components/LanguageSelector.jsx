import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (event) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
    };

    return (
        <div className="relative">
            <div className="absolute top-1/2 right-0 bg-white p-1 border rounded shadow">
                <select
                    className="text-black font-large cursor-pointer bg-transparent border-none outline-none"
                    onChange={changeLanguage}
                    value={i18n.language}
                >
                    <option value="en">{t("EN")}</option>
                    <option value="fr">{t("FR")}</option>
                    {/* Add other options for each supported language */}
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
