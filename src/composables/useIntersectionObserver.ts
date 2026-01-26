// src/composables/useIntersectionObserver.ts
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

  watch(target, (el, _, onCleanup) => {
    // 确保 el 是有效的 Element 类型
    if (!el || !(el instanceof Element))
      return
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