import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './style.css'
import App from './App.vue'
import zh from './i18n/zh.json'
import en from './i18n/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      message: en
    },
    zh: {
      message: zh
    }
  }
})

createApp(App).use(i18n).mount('#app')
