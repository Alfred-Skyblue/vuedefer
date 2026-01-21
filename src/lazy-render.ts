import type { ComponentInternalInstance, PropType, VNode } from 'vue'
import { defineComponent, h, ref, watch } from 'vue'
import { useIntersectionObserver } from './composables/useIntersectionObserver'

export interface LazyRenderProps extends IntersectionObserverInit {
  /**
   * The tag name of the wrapper element
   * @default 'div'
   */
  tag?: string
  /**
   * Freeze update depth
   * @default false
   */
  deep?: boolean | number
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
    deep: {
      type: [Boolean, Number] as PropType<boolean | number>,
      default: false,
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

    let currentVNode: VNode | null = null
    // eslint-disable-next-line ts/no-unsafe-function-type
    const originalRenderCache = new WeakMap<ComponentInternalInstance, Function>()
    const calledCache = new WeakMap<ComponentInternalInstance, boolean>()

    const updateFreeze = (
      component: any,
      freeze: boolean,
      depth: number = Infinity,
    ) => {
      if (!component)
        return

      if (freeze) {
        if (!originalRenderCache.has(component)) {
          originalRenderCache.set(component, component.render)

          component.render = () => {
            calledCache.set(component, true)
            return component.subTree
          }
        }
      }
      else {
        const originRender = originalRenderCache.get(component)
        if (originRender) {
          component.render = originRender
          originalRenderCache.delete(component)

          if (calledCache.get(component)) {
            calledCache.delete(component)
            component.update()
          }
        }
      }

      if (depth > 0) {
        const subTree = component.subTree

        const walk = (node: any) => {
          if (!node)
            return

          if (node.component) {
            updateFreeze(node.component, freeze, depth - 1)
          }
          else if (Array.isArray(node.children)) {
            node.children.forEach(walk)
          }
        }

        walk(subTree)
      }
    }

    const stopWatch = watch(
      isVisible,
      (visible) => {
        if (currentVNode) {
          const component = currentVNode.component
          containerRef.value = currentVNode.el as HTMLElement
          if (component) {
            const depth = props.deep === true ? Infinity : (props.deep || 0)
            updateFreeze(component, !visible, depth)
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
