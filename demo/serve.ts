//note that this is included into <root>/index.html; `vite dev` will use it to find all demo files
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
//helps only if running via in-browser sfc loader; here for demo purposes
app.config.compilerOptions.isCustomElement = (tag: string) => /^layer|^box|^row|^cylinder/.test(tag);
app.mount('#app');
