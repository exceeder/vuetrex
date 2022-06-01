const path = require('path');
module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'dev/assets')
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions = {
                    ...(options.compilerOptions || {}),
                    isCustomElement: tag => /^layer|^box|^row|^cylinder|^stack/.test(tag)
                };
                return options;
            });
    }
}