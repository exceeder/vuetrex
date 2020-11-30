import { DefineComponent, Plugin } from 'vue';


declare const vuetrex: Exclude<Plugin['install'], undefined>;
export default vuetrex;

export const Vuetrex: DefineComponent;
