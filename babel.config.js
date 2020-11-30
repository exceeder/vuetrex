const devPresets = ['@vue/babel-preset-app'];
const buildPresets = ['@babel/preset-typescript','@babel/preset-env'];
module.exports = {
  presets: (process.env.NODE_ENV === 'development' ? devPresets : buildPresets),
};
