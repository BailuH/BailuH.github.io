---
title: TS拓展
createTime: 2026/05/01 20:27:07
permalink: /notes/cs/9fgn3h46/
---
TypeScript是JavaScript的超集，主要在数据类型解析上做了拓展，在Vue开发的场景下，对于提高组件代码的可读性和可维护性有作用（*1️⃣在编译时通过静态分析检测出很多常见错误，2️⃣通过 IDE 中基于类型的自动补全，TypeScript 还改善了开发体验和效率*）
本笔记侧重于TS对于Composition API的拓展方法。

## 为`Props`标注类型
在使用 `<script setup>` 时，`defineProps()` 支持从参数中**自动推导类型**：
```vue
<script setup lang="ts">
const props = defineProps({
  foo: { type: String, required: true },
  bar: Number
})

props.foo // 类型推导为 string
props.bar // 类型推导为 number | undefined
</script>
```

这种写法被称为**运行时声明**——传给 `defineProps()` 的参数会作为运行时的 `props` 选项使用。但更推荐的做法是**基于类型的声明**，直接用 TS 接口描述数据结构，更加直观：
```vue
<script setup lang="ts">
const props = defineProps<{
  foo: string
  bar?: number
}>()
</script>
```

编译器会尽可能根据类型参数推导出等价的运行时选项。两种声明方式**择一使用，不能同时混用**。如果类型较复杂，也可以把接口抽离到单独文件中：
```vue
<script setup lang="ts">
import type { Props } from './foo'
const props = defineProps<Props>()
</script>
```

> **语法限制**：Vue 3.2 及以下版本中，`defineProps()` 的泛型参数仅限类型字面量或本地接口引用。3.3+ 已支持导入的类型和有限复杂类型，但条件类型等仍需实际类型分析的特性尚未支持。

### Props 解构与默认值
使用基于类型的声明时，原生写法无法直接声明默认值。Vue 3.5+ 支持**响应式 Props 解构**，可以直接在解构时赋予默认值：
```ts
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
```

在 3.4 及更低版本中，需要借助 `withDefaults` 编译器宏：
```ts
const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two']  // 对象/数组默认值需用工厂函数
})
```

`withDefaults` 不仅会被编译为等效的运行时 `default` 选项，还会为默认值提供**类型检查**，并确保返回的 props 类型中已声明默认值的属性不再标记为可选（`?`）。

### 复杂的 prop 类型
基于类型的声明可以直接使用任意 TS 类型：
```ts
interface Book {
  title: string
  author: string
  year: number
}

defineProps<{ book: Book }>()
```

如果必须使用运行时声明，Vue 提供了 `PropType` 工具类型来做类型断言：
```ts
import type { PropType } from 'vue'

defineProps({
  book: Object as PropType<Book>
})
```

## 为`ref()`标注类型
`ref()` 会根据初始化值**自动推导**类型：
```ts
import { ref } from 'vue'

const year = ref(2020)        // 推导为 Ref<number>
year.value = '2020'           // ❌ TS Error: 不能将 string 赋给 number
```

当需要覆盖默认推导或指定更复杂的类型时，有两种方式：
**方式一：使用 `Ref<T>` 类型标注变量**
```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

const year: Ref<string | number> = ref('2020')
year.value = 2020             // ✅ 合法
```

**方式二：在调用 `ref()` 时传入泛型参数**
```ts
const year = ref<string | number>('2020')
year.value = 2020             // ✅ 合法
```

如果指定了泛型参数但没有给初始值，推导结果会包含 `undefined`：
```ts
const n = ref<number>()       // 推导为 Ref<number | undefined>
```

## 为`computed()`标注类型
`computed()` 同样会从计算函数的**返回值自动推导**类型：
```ts
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)   // 推导为 ComputedRef<number>

double.value.split('')      // ❌ TS Error: number 上没有 split 方法
```

当你希望显式约束返回类型（例如计算逻辑较长，或需要确保返回值符合接口），可以通过泛型参数指定：
```ts
const double = computed<number>(() => {
  // 若返回值不是 number，TS 会在编译时报错
  return count.value * 2
})
```
