import { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import ReCAPTCHA from "react-google-recaptcha";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaValue) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    emailjs
        .send(
            "portefolio",
            "template_hdq80qc",
            {
              form_name: form.name,
              to_name: "",
              from_email: form.email,
              to_email: "bardiot.marin@mail.com",
              message: form.message,
            },
            "9WyAwWe4Qg3bT7hza5qWl"
        )
        .then(
            () => {
              setLoading(false);
              alert("Thank you. I will get back to you as soon as possible.");

              setForm({
                name: "",
                email: "",
                message: "",
              });
            },
            (error) => {
              setLoading(false);

              console.log(error);
              alert("Something went wrong with our server please direct contact me via linkdin.");
            }
        );
  };

  return (
      <div
          className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
      >
        <motion.div
            variants={slideIn("left", "tween", 0.2, 1)}
            className="flex-[0.75] bg-black-100 p-8 rounded-2xl"
        >
          <p className={styles.sectionSubText}>{t("get_in_touch")}</p>
          <h3 className={styles.sectionHeadText}>Contact.</h3>

          <div className="form-container">
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-12 flex flex-col gap-8"
            >
              <label className="flex flex-col">
              <span className="text-white font-medium mb-4">
                {t("your_name")}
              </span>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("name?")}
                    className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                />
              </label>
              <label className="flex flex-col">
              <span className="text-white font-medium mb-4">
                {t("your_email")}
              </span>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("email?")}
                    className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                />
              </label>
              <label className="flex flex-col">
              <span className="text-white font-medium mb-4">
                {t("your_message")}
              </span>
                <textarea
                    rows={7}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t("message?")}
                    className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                />
              </label>

              {/* Ajouter le widget reCAPTCHA */}
              <ReCAPTCHA
                  sitekey="6LdYBHInAAAAAPw8HZbVPAEeJNbiUyiqAhcgG5XQ" // Remplacez par votre clé d'API reCAPTCHA
                  onChange={handleCaptchaChange}
              />

              <button
                  type="submit"
                  className="bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
                  disabled={!captchaValue || loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div
            variants={slideIn("right", "tween", 0.2, 1)}
            className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
        >
          <EarthCanvas />
        </motion.div>
      </div>
  );
};

export default SectionWrapper(Contact, "contact");
