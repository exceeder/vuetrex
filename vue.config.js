const path = require('path');
module.exports = {
    devServer: {
        static: {
            directory: path.join(__dirname, 'dev/assets')
        },
        compress: true
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