import '../styles/styles.css'

import DefaultTheme from 'vitepress/dist/client/theme-default'
import {Vuetrex} from "../../../dist/vuetrex.esm.js";

// export default {
//     ...DefaultTheme
// }

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        // register global components
        app.component('Vuetrex', Vuetrex)
    }
}