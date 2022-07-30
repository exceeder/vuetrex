import DefaultTheme from 'vitepress/theme'
import {Vuetrex} from "../../../dist/vuetrex.es.js";
import '../styles/styles.css'

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        // register global components
        app.component('Vuetrex', Vuetrex)
    }
}