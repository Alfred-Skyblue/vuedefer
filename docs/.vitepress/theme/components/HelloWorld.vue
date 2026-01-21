<script setup lang="ts">
defineProps<{
  timing: number
}>()

const emit = defineEmits<{
  change: [value: number]
}>()

function emitChange(value: number) {
  emit('change', value)
  return value
}
</script>

<template>
  <div class="container">
    <div class="component-header">
      <span class="component-icon">
        🎉
      </span>
      <span>HelloWorld Component</span>
    </div>
    <div class="component-body">
      <p>
        This component is now mounted!
      </p>
      <p class="update-info">
        Live Timing: <strong>{{ emitChange(timing) }}</strong>
      </p>
      <p class="description">
        When you scroll this component out of viewport, updates will be frozen.
        Scroll back to resume updates.
      </p>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--vp-c-border);
}

.component-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.component-icon {
  font-size: 20px;
}

.component-body {
  padding: 20px;
}

.component-body p {
  margin: 0 0 12px 0;
}

.update-info {
  font-size: 18px;
  color: var(--vp-c-brand-1);
}

.description {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style>
