module.exports = {
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions = {
                    ...(options.compilerOptions || {}),
                    isCustomElement: tag => /^layer|^box|^row|^cylinder/.test(tag)
                };
                return options;
            });
    }
}