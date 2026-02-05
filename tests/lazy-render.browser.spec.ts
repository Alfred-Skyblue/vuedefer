import type { VNode } from 'vue'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import { h, nextTick, ref, Transition } from 'vue'
import { LazyRender } from '../src/lazy-render'

const DefaultText = 'Hello world!'
const FallbackText = 'Live!'
const DefaultComp = () => h('div', DefaultText)
const FallbackComp = () => h('p', FallbackText)

describe('lazy-render', () => {
  it('component is defined', () => {
    expect(LazyRender).toBeDefined()
  })

  it('component name is LazyRender', () => {
    expect(LazyRender.name).toBe('LazyRender')
  })

  it('slot render', async () => {
    const { getByText } = render(() => createComponent(10))

    await expect.element(getByText(DefaultText)).not.toBeInTheDocument()
    await expect.element(getByText(FallbackText)).toBeInTheDocument()

    window.scrollTo(0, 200)
    await expect.element(getByText(DefaultText)).toBeInTheDocument()
    await expect.element(getByText(FallbackText)).not.toBeInTheDocument()

    window.scrollTo(0, 0)
    await expect.element(getByText(DefaultText)).toBeInTheDocument()
    await expect.element(getByText(FallbackText)).not.toBeInTheDocument()
  })

  describe('use vue\'s components wrapper', () => {
    it('transition ', async () => {
      const flag = ref(true)
      const { getByText } = render(() => h(Transition, null, () => flag.value ? [] : createComponent(1)))
      await expect.element(getByText(DefaultText)).not.toBeInTheDocument()

      flag.value = false
      await nextTick()
      await expect.element(getByText(FallbackText)).toBeInTheDocument()
    })
  })
})

function createDOMElements(length: number): Array<VNode> {
  return Array.from({ length }).map((_, index) => h('div', { style: { height: '100px' } }, `Item ${index + 1}`))
}

function createComponent(length: number, tag: string = 'section'): VNode {
  return h(tag, [...createDOMElements(length), h(LazyRender, null, { default: DefaultComp, fallback: FallbackComp })])
}
