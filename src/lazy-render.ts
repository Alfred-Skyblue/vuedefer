import type { PropType, VNode } from 'vue'
import {
  defineComponent,
  h,
  ref,
  watch,
} from 'vue'
import { useIntersectionObserver } from './composables/useIntersectionObserver'

export interface LazyRenderProps extends IntersectionObserverInit {
  /**
   * The tag name of the wrapper element
   * @default 'div'
   */
  tag?: string
  /**
   * Whether to stop observing after the component becomes visible for the first time.
   * @default false
   */
  once?: boolean
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
    once: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { slots, emit }) {
    const containerRef = ref<HTMLElement | null>(null)
    const { isVisible } = useIntersectionObserver(
      containerRef,
      {
        root: props.root,
        rootMargin: props.rootMargin,
        threshold: props.threshold,
        once: props.once,
      },
    )

    // eslint-disable-next-line ts/no-unsafe-function-type
    let render: Function | null
    let currentVNode: VNode | null = null
    let called = false
    watch(
      isVisible,
      (visible) => {
        if (currentVNode) {
          const component: any = currentVNode.component!
          containerRef.value = currentVNode.el as HTMLElement
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
          emit('change', visible)
        }
      },
      { flush: 'post' },
    )

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
