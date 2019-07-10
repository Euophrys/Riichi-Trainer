import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { ja } from "./translations/ja";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      ja: ja
    },
    fallbackLng: "en",

    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: '.'
  });

export default i18n;
