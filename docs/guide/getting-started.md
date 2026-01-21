# Getting Started

## What is vuedefer?

**vuedefer** is a Vue 3 lazy rendering component based on the IntersectionObserver API. Its core concept is: **only render what users can see**.

### Use Cases

#### 1. Long Lists / Infinite Scroll Pages

When a page contains many components, mounting them all at once can slow down initial load. Use `LazyRender` to mount list items only when they scroll into view:

```vue
<template>
  <div v-for="item in items" :key="item.id">
    <LazyRender>
      <ItemCard :data="item" />
      <template #fallback>
        <div class="skeleton" />
      </template>
    </LazyRender>
  </div>
</template>
```

#### 2. Complex Chart Components

Chart libraries like ECharts and AntV have significant rendering overhead. For charts not in the initial viewport, delay their mounting:

```vue
<template>
  <LazyRender>
    <SalesChart :data="salesData" />
    <template #fallback>
      <div class="chart-placeholder">Loading chart...</div>
    </template>
  </LazyRender>
</template>
```

## Installation

::: code-group

```bash [npm]
npm install vuedefer
```

```bash [pnpm]
pnpm add vuedefer
```

```bash [yarn]
yarn add vuedefer
```

:::

## Basic Usage

```vue
<script setup lang="ts">
import { LazyRender } from 'vuedefer'
import HelloWorld from './HelloWorld.vue'
</script>

<template>
  <LazyRender>
    <HelloWorld />
    <template #fallback>
      <div class="placeholder">Loading...</div>
    </template>
  </LazyRender>
</template>
```

## Live Demo

Try scrolling in the box below to see lazy loading in action:

<ClientOnly>
  <Demo />
</ClientOnly>

::: tip Notice
- **Status indicator** shows whether the component is mounted
- **Timing** increments every second - when the component leaves viewport, updates are frozen
- Scroll the component out of view and back to observe the freeze/resume behavior via the devtools
:::

## How It Works

1. **Initial State** - When the component is not in the viewport, the `fallback` slot content is rendered as a placeholder
2. **Entering Viewport** - When the component enters the viewport (detected by IntersectionObserver), the actual component in the `default` slot is mounted and rendered
3. **Leaving Viewport** - When the component leaves the viewport, its `render` function is replaced to return the current `subTree`, freezing updates and avoiding unnecessary re-renders
4. **Re-entering** - When the component re-enters the viewport, the original `render` function is restored, allowing the component to respond to data changes and re-render

## Examples

### Track Mount Status

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LazyRender } from 'vuedefer'
import HelloWorld from './HelloWorld.vue'

const isMounted = ref(false)
</script>

<template>
  <div class="container">
    <!-- Status indicator -->
    <div class="status" :class="{ mounted: isMounted }">
      {{ isMounted ? '✅ Mounted' : '⏳ Not mounted' }}
    </div>

    <!-- Spacer to simulate scrolling -->
    <div style="height: 100vh;">
      <p>👇 Scroll down to see lazy loading in action...</p>
    </div>

    <!-- Lazy loaded component -->
    <LazyRender>
      <HelloWorld @vue:mounted="isMounted = true" />
      <template #fallback>
        <div class="placeholder">Loading...</div>
      </template>
    </LazyRender>
  </div>
</template>
```

### Custom Root Element and Margin

Specify a custom scroll container and trigger margin:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LazyRender } from 'vuedefer'

const scrollContainer = ref<HTMLElement | null>(null)
</script>

<template>
  <div ref="scrollContainer" class="scroll-container">
    <LazyRender :root="scrollContainer" root-margin="100px">
      <ExpensiveChart />
      <template #fallback>
        <div class="skeleton">Loading chart...</div>
      </template>
    </LazyRender>
  </div>
</template>
```

### Configure Visibility Threshold

Use `threshold` to control how much of the component must be visible to trigger rendering:

```vue
<template>
  <!-- Trigger rendering when 50% of the component is visible -->
  <LazyRender :threshold="0.5">
    <VideoPlayer />
    <template #fallback>
      <div class="video-placeholder">Preparing video...</div>
    </template>
  </LazyRender>
</template>
```

### Custom Wrapper Tag

```vue
<template>
  <!-- Use section as the wrapper element -->
  <LazyRender tag="section">
    <ArticleContent />
    <template #fallback>
      <div class="article-skeleton" />
    </template>
  </LazyRender>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | `string` | `'div'` | The HTML tag name of the wrapper element |
| `root` | `Element \| Document \| ShadowRoot \| null` | `null` | The element used as the viewport for checking visibility. Must be an ancestor of the target. Defaults to the browser viewport if not specified. |
| `rootMargin` | `string` | `undefined` | Margin around the root element. Can have values similar to CSS margin property (e.g., `'10px 20px 30px 40px'`). Useful for triggering visibility earlier. |
| `threshold` | `number \| number[]` | `undefined` | A number or array of numbers indicating at what percentage of the target's visibility the callback should be triggered. `0` means trigger as soon as 1 pixel is visible, `0.5` means 50% visible, `1` means fully visible. |

### Emits

| Event | Payload | Description |
| --- | --- | --- |
| `change` | `(visible: boolean)` | Emitted when visibility state changes. `true` when entering viewport, `false` when leaving. |

### Slots

| Slot | Description |
| --- | --- |
| `default` | The content to be lazily rendered. Will be mounted when entering viewport and frozen when leaving. |
| `fallback` | Placeholder content displayed before the component enters the viewport. |
