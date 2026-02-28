import { config } from '@vue/test-utils'

// Match the isCustomElement rule already defined in vite.config.mts for the
// SFC compiler. This covers runtime-compiled templates (inline template strings
// in test fixtures) which bypass the Vite plugin's SFC compiler pass.
config.global.config.compilerOptions = {
    isCustomElement: (tag: string) => /^layer|^box|^row|^cylinder|^stack/.test(tag)
}
