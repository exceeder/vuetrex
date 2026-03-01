import { afterEach, describe, it, expect, vi } from 'vitest'
import { nodeOps } from '@/lib-components/nodeOps'
import { registerElement, types } from '@/lib-components/nodes/types'
import { Comment } from '@/lib-components/nodes/Root'
import { Base } from '@/lib-components/nodes/Base'
import type { FunctionalComponent, ClassComponent } from '@/lib-components/nodes/types'

// ── Minimal test doubles (no Three.js / stage dependency) ────────────────────

class TestNode extends Base {
    public state: Record<string, any> = {}
    protected subscribeEvents() {}
}
(TestNode.prototype as any)['__v_skip'] = true

// FunctionalComponent: stage is ignored, returns a caller-supplied node.
const makeFunctional = () => {
    const node = new TestNode()
    const impl: FunctionalComponent = { setup: () => node }
    return { impl, node }
}

// ClassComponent: extends Base (not Node), so no Element3d / stage needed.
class TestClassElement extends Base {
    public state: Record<string, any> = {}
    protected subscribeEvents() {}
    constructor(_stage: any) { super() }
}
(TestClassElement.prototype as any)['__v_skip'] = true

// Stage is not touched by our test implementations.
const mockStage = null as any

// ── registerElement — global registry ────────────────────────────────────────

describe('registerElement', () => {
    const TAG = 'vx-test-custom'

    afterEach(() => {
        delete (types as any)[TAG]
    })

    it('adds the tag to the global registry', () => {
        const { impl } = makeFunctional()
        registerElement(TAG, impl)
        expect(types[TAG]).toBe(impl)
    })

    it('replaces a previous registration for the same tag', () => {
        const { impl: first } = makeFunctional()
        const { impl: second } = makeFunctional()
        registerElement(TAG, first)
        registerElement(TAG, second)
        expect(types[TAG]).toBe(second)
    })
})

// ── nodeOps.createElement — per-instance extraTypes ──────────────────────────

describe('nodeOps.createElement', () => {

    it('resolves a FunctionalComponent from extraTypes and calls setup()', () => {
        const { impl, node } = makeFunctional()
        const { createElement } = nodeOps(mockStage, { 'vx-sphere': impl })
        expect(createElement('vx-sphere')).toBe(node)
    })

    it('resolves a ClassComponent from extraTypes and instantiates it', () => {
        const { createElement } = nodeOps(mockStage, { 'vx-custom': TestClassElement as unknown as ClassComponent })
        expect(createElement('vx-custom')).toBeInstanceOf(TestClassElement)
    })

    it('extraTypes take priority over built-in tags for the same tag name', () => {
        const { impl, node } = makeFunctional()
        // Override the built-in 'row' for this instance only — no other instance is affected.
        const { createElement } = nodeOps(mockStage, { row: impl })
        expect(createElement('row')).toBe(node)
    })

    it('falls back to the global registry when tag is absent from extraTypes', () => {
        const TAG = 'vx-fallback-test'
        const { impl, node } = makeFunctional()
        registerElement(TAG, impl)
        try {
            const { createElement } = nodeOps(mockStage, {})
            expect(createElement(TAG)).toBe(node)
        } finally {
            delete (types as any)[TAG]
        }
    })

    it('returns a Comment node and warns for an unknown tag', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { createElement } = nodeOps(mockStage)
        const result = createElement('vx-does-not-exist')
        expect(result).toBeInstanceOf(Comment)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('vx-does-not-exist'))
        warn.mockRestore()
    })
})
