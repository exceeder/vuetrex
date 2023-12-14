import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    root: __dirname,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/lib-components/index.ts'),
            name: 'Vuetrex',
            formats: ['es', 'umd'],
            fileName: (format: string) => `vuetrex.${format}.js`,
        },
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "src/lib-components/index.ts")
            },
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: 'Vue',
                    three: 'THREE'
                }
            },
            external: ['vue', 'three'],
            // https://rollupjs.org/guide/en/#big-list-of-options
        },
        target: "esnext",
        sourcemap: true
    },
    plugins: [
        vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag:string) => /^layer|^box|^row|^cylinder/.test(tag)
            }
        }})
    ],
    test: {
        globals: true,
        environment: "happy-dom"
    }
})
