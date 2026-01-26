import type { Ref } from 'vue'
import {
  onUnmounted,
  ref,
  watch,
} from 'vue'

/**
 * useIntersectionObserver - Observes element visibility in viewport
 * @param target - Target element ref to observe
 * @param options - IntersectionObserver options
 * @returns isVisible - Reactive visibility state
 */
export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  options?: IntersectionObserverInit,
) {
  const isVisible = ref(false)

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
    },
    options,
  )

  // Custom type guard function to explicitly check the element type
  function isElement(value: any): value is Element {
    return value !== null && value !== undefined && value instanceof Element
  }

  watch(target, (el, _, onCleanup) => {
    if (!isElement(el)) return
    
    observer.observe(el)
    onCleanup(() =>
      observer.unobserve(el),
    )
  }, { immediate: true })

  function stop() {
    observer.disconnect()
  }

  onUnmounted(stop)

  return { isVisible, stop }
}