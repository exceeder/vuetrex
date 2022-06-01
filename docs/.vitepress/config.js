/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
    lang: "en-US",
    title: 'Vuetrex',
    description: '3D visualizations with Vue3 and WebGL',
    locales: {
        '/': {
            lang: 'en-US',
            title: 'Vuetrex',
            description: '3D visualizations with Vue3 and WebGL'
        }
    },
    head: [
        ['link', { rel: 'icon', href: `/favicon.ico` }]
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        repo: 'exceeder/vuetrex',
        docsDir: 'docs',
        docsBranch: '4.0',

        editLinks: true,
        locales: {
            '/': {
                label: 'English',
                selectText: 'Languages',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',

                nav: [
                    {text: 'Guide', link: '/guide/'},
                    {text: 'API Reference', link: '/api/'},
                    {text: 'Release Notes', link: 'https://github.com/exceeder/vuetrex/releases'},
                ],

                sidebar: [
                    {
                        text: 'Introduction', link: '/guide/'
                    },
                    {
                        text: 'Core Concepts', link: '/api/'
                    },
                    {
                        text: 'Advanced', link: '/api/advanced'
                    }
                ]
            }
        }

    }
}

export default config