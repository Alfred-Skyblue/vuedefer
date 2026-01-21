# 使用指南

## 什么是 vuedefer？

**vuedefer** 是一个基于 IntersectionObserver API 的 Vue 3 懒渲染组件。它的核心理念是：**只渲染用户看得见的内容**。

### 使用场景

#### 1. 长列表 / 无限滚动页面

当页面包含大量组件时，一次性挂载所有组件会导致首屏加载缓慢。使用 `LazyRender` 可以让列表项只在滚动到可见区域时才挂载：

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

#### 2. 复杂图表组件

ECharts、AntV 等图表库渲染复杂图表时开销较大。对于不在首屏的图表，可以延迟挂载：

```vue
<template>
  <LazyRender>
    <SalesChart :data="salesData" />
    <template #fallback>
      <div class="chart-placeholder">图表加载中...</div>
    </template>
  </LazyRender>
</template>
```

## 安装

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

## 基本用法

```vue
<script setup lang="ts">
import { LazyRender } from 'vuedefer'
</script>

<template>
  <LazyRender>
    <HelloWorld />
    <template #fallback>
      <div class="placeholder">加载中...</div>
    </template>
  </LazyRender>
</template>
```

## 在线演示

在下方容器中滚动，体验懒挂载效果：

<ClientOnly>
  <Demo />
</ClientOnly>

::: tip 注意观察
- **状态指示器** 显示组件是否已挂载
- **Timing** 每秒递增 - 当组件离开视口时，更新会被冻结
- 将组件滚出视口再滚回来，在调试工具观察冻结/恢复行为
:::

## 工作原理

1. **初始状态** - 当组件不在视口内时，渲染 `fallback` 插槽内容作为占位符
2. **进入视口** - 当组件进入视口时（通过 IntersectionObserver 检测），`default` 插槽中的实际组件被挂载并渲染
3. **离开视口** - 当组件离开视口时，其 `render` 函数被替换为返回当前的 `subTree`，冻结更新以避免不必要的重渲染
4. **再次进入** - 当组件再次进入视口时，恢复原始的 `render` 函数，组件可以响应数据变化并重新渲染

## 示例

### 追踪挂载状态

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LazyRender } from 'vuedefer'
import HelloWorld from './HelloWorld.vue'

const isMounted = ref(false)
</script>

<template>
  <div class="container">
    <!-- 状态指示器 -->
    <div class="status" :class="{ mounted: isMounted }">
      {{ isMounted ? '✅ 已挂载' : '⏳ 未挂载' }}
    </div>

    <!-- 用于模拟滚动的占位 -->
    <div style="height: 100vh;">
      <p>👇 向下滚动查看懒加载效果...</p>
    </div>

    <!-- 懒加载组件 -->
    <LazyRender>
      <HelloWorld @vue:mounted="isMounted = true" />
      <template #fallback>
        <div class="placeholder">加载中...</div>
      </template>
    </LazyRender>
  </div>
</template>
```

### 自定义根元素和边距

指定自定义滚动容器和触发边距：

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
        <div class="skeleton">图表加载中...</div>
      </template>
    </LazyRender>
  </div>
</template>
```

### 配置可见性阈值

使用 `threshold` 控制组件需要可见多少才触发渲染：

```vue
<template>
  <!-- 当组件 50% 可见时触发渲染 -->
  <LazyRender :threshold="0.5">
    <VideoPlayer />
    <template #fallback>
      <div class="video-placeholder">视频准备中...</div>
    </template>
  </LazyRender>
</template>
```

### 自定义包装标签

```vue
<template>
  <!-- 使用 section 作为包装元素 -->
  <LazyRender tag="section">
    <ArticleContent />
    <template #fallback>
      <div class="article-skeleton" />
    </template>
  </LazyRender>
</template>
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tag` | `string` | `'div'` | 包装元素的 HTML 标签名 |
| `root` | `Element \| Document \| ShadowRoot \| null` | `null` | 用于检测可见性的视口元素，必须是目标元素的祖先元素。未指定时默认使用浏览器视口。 |
| `rootMargin` | `string` | `undefined` | 根元素的外边距，类似 CSS margin 属性（如 `'10px 20px 30px 40px'`）。可用于提前触发可见性检测。 |
| `threshold` | `number \| number[]` | `undefined` | 一个数字或数字数组，表示目标元素可见多少比例时触发回调。`0` 表示只要有 1 像素可见就触发，`0.5` 表示 50% 可见，`1` 表示完全可见。 |

### 事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `(visible: boolean)` | 当可见性状态改变时触发。进入视口时为 `true`，离开视口时为 `false`。 |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| `default` | 需要懒渲染的内容。进入视口时挂载，离开视口时冻结更新。 |
| `fallback` | 组件进入视口前显示的占位内容。 |
