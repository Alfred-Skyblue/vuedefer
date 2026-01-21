<script setup lang="ts">
import { ref } from 'vue'
import { LazyRender } from '../../../../src'
import HelloWorld from './HelloWorld.vue'

const isMounted = ref(false)
const timing = ref(0)
const childTiming = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)

// Simulate data updates
setInterval(() => {
  timing.value++
}, 1000)

// Handle timing updates from child component
function handleChildChange(value: number) {
  childTiming.value = value
}
</script>

<template>
  <div class="demo-wrapper">
    <div class="demo-header">
      <div class="status-bar">
        <span class="status-item">
          <span class="status-dot" :class="isMounted ? 'mounted' : 'pending'" />
          {{ isMounted ? 'Mounted' : 'Not Mounted' }}
        </span>
        <span class="status-item">
          <span class="update-icon">⏳</span>
          Parent Timing: {{ timing }}
        </span>
        <span class="status-item highlight">
          <span class="update-icon">🔄</span>
          Child Timing: {{ childTiming }}
        </span>
      </div>
      <p class="hint">
        👇 Scroll down in the box below to see lazy loading in action
      </p>
    </div>

    <div ref="scrollContainer" class="scroll-container">
      <div class="spacer">
        <div class="scroll-hint">
          <span>↓</span>
          <span>Keep scrolling...</span>
          <span>↓</span>
        </div>
      </div>

      <LazyRender :root="scrollContainer" root-margin="0px">
        <HelloWorld
          :timing="timing"
          @vue:mounted="isMounted = true"
          @change="handleChildChange"
        />
        <template #fallback>
          <div class="placeholder">
            <div class="placeholder-icon">
              ⏳
            </div>
            <div>
              Loading...
            </div>
          </div>
        </template>
      </LazyRender>

      <div class="spacer bottom">
        <div class="scroll-hint">
          <span>↑</span>
          <span>Scroll up to see the component</span>
          <span>↑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.demo-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
}

.status-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-item.highlight {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.pending {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.status-dot.mounted {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.update-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hint {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.scroll-container {
  height: 300px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.spacer {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.spacer.bottom {
  background: linear-gradient(0deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 14px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.placeholder {
  margin: 20px;
  height: 180px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--vp-c-bg);
  border: 2px dashed var(--vp-c-border);
  color: var(--vp-c-text-2);
}

.placeholder-icon {
  font-size: 32px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
