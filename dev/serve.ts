import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
//helps only if running via in-browser sfc loader; here for demo purposes
app.config.isCustomElement = (tag: string) => /^layer|^box|^row|^cylinder/.test(tag);
app.mount('#app');
