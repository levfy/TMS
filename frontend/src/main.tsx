import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ruTranslations from '@locales/ru.json'
import kkTranslations from '@locales/kk.json'

// Initialize i18n for Russian & Kazakh
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ruTranslations },
      kk: { translation: kkTranslations },
    },
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
