import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { ja } from "./translations/ja";
import { fr } from "./translations/fr";
import { pl } from "./translations/pl";
import { ru } from "./translations/ru";
import { pt } from "./translations/pt";
import { zh_CN } from "./translations/zh_CN";
import { ko } from "./translations/ko";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      ja: ja,
      fr: fr,
      pl: pl,
      ru: ru,
      pt: pt,
      zh: zh_CN,
      zh_CN: zh_CN,
      ko: ko
    },
    fallbackLng: "en",

    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: '.',
    interpolation: {
      defaultVariables: { repeats: "0" }
    }
  });

export default i18n;
