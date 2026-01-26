import type { PropType, VNode } from 'vue'
import { defineComponent, h, ref, watch } from 'vue'
import { useIntersectionObserver } from './composables/useIntersectionObserver'

export interface LazyRenderProps extends IntersectionObserverInit {
  /**
   * The tag name of the wrapper element
   * @default 'div'
   */
  tag?: string
}

/**
 * LazyRender - Lazy rendering component
 *
 * Mounts and updates slot content only when the component enters the viewport.
 * Optionally freezes updates when leaving the viewport to optimize performance.
 *
 * @example
 * ```vue
 * <LazyRender>
 *   <HelloWorld />
 *   <template #fallback>
 *     <div class="placeholder">Loading...</div>
 *   </template>
 * </LazyRender>
 * ```
 */
export const LazyRender = defineComponent<LazyRenderProps>({
  name: 'LazyRender',
  props: {
    root: {
      type: Object as PropType<Element | Document | ShadowRoot | null>,
      default: null,
    },
    tag: {
      type: String,
      default: 'div',
    },
    rootMargin: {
      type: String,
      default: undefined,
    },
    threshold: {
      type: [Number, Array] as PropType<number | number[]>,
      default: undefined,
    },
  },
  emits: ['change'],
  setup(props, { slots, emit }) {
    const containerRef = ref<HTMLElement | null>(null)
    const { isVisible, stop } = useIntersectionObserver(
      containerRef,
      {
        root: props.root,
        rootMargin: props.rootMargin,
        threshold: props.threshold,
      },
    )

    // eslint-disable-next-line ts/no-unsafe-function-type
    let render: Function | null
    let currentVNode: VNode | null = null
    let called = false

    const stopWatch = watch(
      isVisible,
      (visible) => {
        if (currentVNode) {
          const component: any = currentVNode.component!
          // 确保 el 是有效的 Element 类型
          if (currentVNode.el instanceof Element) {
            containerRef.value = currentVNode.el as HTMLElement
          }
          if (component) {
            if (!visible) {
              const _render = component.render
              component.render = () => {
                called = true
                return component.subTree
              }
              render = _render
            }
            else {
              component.render = render || component.render
              if (called) {
                component.update()
              }
            }
          }
          else {
            cleanup()
          }

          emit('change', visible)
        }
      },
      { flush: 'post' },
    )

    function cleanup() {
      stop()
      stopWatch()
    }

    return () => {
      if (!isVisible.value && !currentVNode) {
        return h(props.tag!, { ref: containerRef }, slots.fallback?.())
      }
      const vnode = slots.default?.()
      currentVNode = vnode![0]
      return vnode
    }
  },
})