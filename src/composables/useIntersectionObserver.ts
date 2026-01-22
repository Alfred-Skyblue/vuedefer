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
  options: IntersectionObserverInit & { once?: boolean },
) {
  const { once, ...rest } = options
  const isVisible = ref(false)

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (once && isVisible.value)
        return
      isVisible.value = entry.isIntersecting
      if (once && entry.isIntersecting) {
        stop()
      }
    },
    rest,
  )

  const _stop = watch(target, (el, _, onCleanup) => {
    if (!el || (once && isVisible.value))
      return
    observer.observe(el)
    onCleanup(() =>
      observer.unobserve(el),
    )
  }, { immediate: true })

  function stop() {
    observer.disconnect()
    _stop?.()
  }

  onUnmounted(stop)

  return { isVisible, stop }
}
