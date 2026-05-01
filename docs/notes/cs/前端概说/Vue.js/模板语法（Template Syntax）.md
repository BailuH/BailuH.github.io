## 常见的指令
指令是带有 `v-` 前缀的特殊属性，用于在表达式值变化时**响应式地操作 DOM**。
![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260427144721769.png)


| 指令集                  | 作用                                                                                                            | 常用方法                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `v-model`            | 绑定变量和元素                                                                                                       |                                                                                            |
| `v-bind`             | 类与样式绑定                                                                                                        |                                                                                            |
| `v-on`               | 我们可以使用 `v-on` 指令（通常简写为 `@` 符号）来监听 **DOM** 事件，并在事件触发时执行一些 JavaScript 代码。                                       | `v-on`的取值可以是内联的（表现为写在`<template>`的JS代码），也可以是写在`<script>`的方法。                               |
| `v-if`               | 条件为真时才渲染该元素；为假时元素**不进入 DOM**（销毁/重建），且是**懒加载**的（初始为假时不渲染）。                                                     | `<h1 v-if="awesome">Vue is awesome!</h1>`                                                  |
| `v-else`             | 作为 `v-if` 的"否则"分支，必须**紧跟**在 `v-if` 或 `v-else-if` 之后。                                                          | `<h1 v-if="awesome">Yes</h1><h1 v-else>No</h1>`                                            |
| `v-else-if`          | 作为 `v-if` 的"否则如果"分支，可链式使用，也必须**紧跟**在前一个条件指令之后。                                                                | `<div v-if="type==='A'">A</div><div v-else-if="type==='B'">B</div><div v-else>Other</div>` |
| `v-show`             | 条件切换元素的 **CSS `display` 属性**，元素**始终存在于 DOM** 中，只是显示/隐藏。不支持 `<template>`，也不能与 `v-else` 配合使用。                   | `<h1 v-show="ok">Hello!</h1>`                                                              |
| `v-if on <template>` | 当需要同时控制**多个元素**的显隐时，可将 `v-if`（以及 `v-else` / `v-else-if`）放在不可见的 `<template>` 包装器上，最终渲染结果不会包含该 `<template>` 标签。 | `<template v-if="ok"><h1>Title</h1><p>Paragraph</p></template>`                            |
| `v-for`              |                                                                                                               |                                                                                            |




## 计算属性
如果某个值在模板里写起来*啰嗦、重复，或者需要过滤/转换*后才能展示，而且**它自己不直接存储原始数据**——就该用计算属性 `computed`。
```js
const firstName = ref('张')
const lastName = ref('三')

// 派生出一个"全名"
const fullName = computed(() => firstName.value + lastName.value)
```

## 自定义指令
自定义指令是 Vue 提供的第三种代码复用方式（前两种是**组件**和**组合式函数**），专门用于**需要对普通元素进行底层 DOM 操作**的场景。
> 只有当内置指令（如 `v-bind`）无法实现、必须直接操作 DOM 时才应该使用。例如自动聚焦 `v-focus`。
### 注册方式
总的来说自定义指令分为两类：==全局自定义指令和局部自定义指令==，一般情况下用的多的是**局部自定义指令**，而其中比较精简的写法是`Composition API`的写法：
1. 在`<script setup>` 中定义常量，命名规范符合一定规范（**camelCase，以v打头，第一个字母大写**）
2. 在`<template>`中使用指令也要符合一定的规范（**kebab-case，以v-开头，全小写**）

|            方式            |                             写法                              | 作用范围 |
| :----------------------: | :---------------------------------------------------------: | :--: |
| **局部（`<script setup>`）** | 声明 `const vNameOfDirective = {...}`，遵循 `v` + camelCase 命名规范 | 当前组件 |
|   **局部（Options API）**    |            在 `directives: { name: {...} }` 选项中注册            | 当前组件 |
|          **全局**          |               `app.directive('name', {...})`                | 整个应用 |
### 指令生命周期钩子
一个指令定义对象可以包含以下钩子（全部可选）：

| 钩子              | 触发时机                        |
| --------------- | --------------------------- |
| `created`       | 绑定元素的 attribute 或事件监听器被应用之前 |
| `beforeMount`   | 元素即将插入 DOM 之前               |
| `mounted`       | 绑定元素的父组件及所有子组件挂载完成后         |
| `beforeUpdate`  | 父组件更新之前                     |
| `updated`       | 父组件及所有子组件更新完成后              |
| `beforeUnmount` | 父组件卸载之前                     |
| `unmounted`     | 父组件卸载之后                     |
![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260428082155659.png)

### 钩子参数
每个钩子接收以下参数：
- **`el`**：指令绑定的真实 DOM 元素，可直接操作。
- **`binding`**：一个对象，包含：
    - `value`：指令接收的值（如 `v-demo="1+1"` 中值为 `2`）
    - `oldValue`：之前的值（仅在 `beforeUpdate` 和 `updated` 中可用）
    - `arg`：指令参数（如 `v-demo:foo` 中 `arg` 为 `"foo"`）
    - `modifiers`：修饰符对象（如 `v-demo.foo.bar` 中为 `{ foo: true, bar: true }`）
    - `instance`：使用指令的组件实例
    - `dir`：指令定义对象本身
- **`vnode`**：当前绑定的 VNode。
- **`prevVnode`**：上一次渲染的 VNode（仅在 `beforeUpdate` 和 `updated` 中）。
> 除 `el` 外，这些参数应视为**只读**，不要修改。

