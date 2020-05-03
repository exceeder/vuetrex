import { createApp } from 'vue';
import App from './App.vue'

const dateToStringFormatter = (date) => {
    return '[' + date.toLocaleString() + ']';
}

const app = createApp(App)
app.provide('dateToStringFormatter', dateToStringFormatter)
app.mount('#app')

