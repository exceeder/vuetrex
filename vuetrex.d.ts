import { DefineComponent, Plugin } from 'vue';


declare const Vuetrex: Exclude<Plugin['install'], undefined>;
export default Vuetrex;

export const VuetrexSample: DefineComponent;
