 >⚠️ 以下内容来源于Kimi-K2.5大模型，自辩真伪。

Vue.js 的 **Options API** 与 **Composition API** 是两种截然不同的**组件逻辑组织方式**，分别代表了"配置对象"与"组合函数"两种编程范式。

## 核心区别对比

| 维度 | Options API | Composition API |
|------|-------------|-----------------|
| **代码组织** | 按选项类型纵向分割（data、methods、computed 分散） | 按功能逻辑横向组合（相关代码聚集在一起） |
| **逻辑复用** | Mixins（命名冲突、来源不明） | Composable 函数（清晰、可追踪） |
| **TypeScript** | 类型推断较差，需要装饰器或额外配置 | 原生支持，类型推断极佳 |
| **代码位置** | 固定的选项名（methods、watch 等） | 自由的函数调用（setup 或 `<script setup>`） |
| **最小代码量** | 需要完整的选项对象结构 | 更精简，只需导入需要的函数 |

## 1. 代码组织方式（最本质差异）

### Options API：纵向切割
功能逻辑被强制拆散到不同选项中：
```vue
<script>
export default {
  data() {
    return {
      user: null,      // 用户相关
      searchQuery: '', // 搜索相关
      posts: []        // 文章相关
    }
  },
  computed: {
    fullName() { /* 用户逻辑 */ },      // 分散
    filteredPosts() { /* 搜索+文章逻辑 */ } // 混杂
  },
  methods: {
    fetchUser() { /* 用户逻辑 */ },     // 分散
    fetchPosts() { /* 文章逻辑 */ },    // 分散
    handleSearch() { /* 搜索逻辑 */ }   // 分散
  },
  watch: {
    searchQuery() { /* 搜索逻辑 */ }    // 再次分散
  }
}
</script>
```
**痛点**：实现一个搜索功能需要在 data、computed、methods、watch 之间跳跃查看。

### Composition API：横向组合
按功能逻辑聚合代码：
```vue
<script setup>
import { ref, computed, watch } from 'vue'
import { useUser } from './composables/useUser'
import { usePosts } from './composables/usePosts'

// 用户功能（独立、内聚）
const { user, fullName, fetchUser } = useUser()

// 搜索功能（独立、内聚）
const searchQuery = ref('')
const handleSearch = () => { /* ... */ }
watch(searchQuery, handleSearch)

// 文章功能（独立、内聚）
const { posts, filteredPosts, fetchPosts } = usePosts(searchQuery)

// 生命周期也按功能聚集
onMounted(() => {
  fetchUser()
  fetchPosts()
})
</script>
```
**优势**：每个功能（用户、搜索、文章）的代码都内聚在一起，维护时只需关注相关区域。

## 2. 逻辑复用机制

### Options API：Mixins（已不推荐）
```javascript
// mixin.js
export default {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
}

// 组件.vue
export default {
  mixins: [myMixin],
  // 问题：count 从哪来的？是否与其他 mixin 冲突？难以追溯
}
```

### Composition API：Composables（推荐）
```javascript
// useCounter.js
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// 组件.vue
import { useCounter } from './useCounter'
const { count, increment } = useCounter()
// 来源清晰，可解构重命名避免冲突：const { count: userCount } = useCounter()
```

## 3. 实际使用建议

### 何时选择 Options API？
- **小型组件**（< 100 行代码，逻辑简单）
- **快速原型开发**（代码量少时结构清晰）
- **团队迁移期**（如果团队更熟悉 Vue 2 风格）
- **单功能组件**（只需要展示少量数据）

### 何时必须使用 Composition API？
- **中大型组件**（逻辑复杂、功能点多）
- **需要 TypeScript**（类型安全要求高）
- **逻辑复用需求**（需要在多个组件间共享状态逻辑）
- **跨组件逻辑抽象**（如权限检查、数据获取、表单处理）

## 4. 语法细节对比

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| **响应式数据** | `data() { return { count: 0 } }` | `const count = ref(0)` |
| **计算属性** | `computed: { double() { return this.count * 2 } }` | `const double = computed(() => count.value * 2)` |
| **方法** | `methods: { increment() { ... } }` | `const increment = () => { ... }` |
| **监听** | `watch: { count(newVal) { ... } }` | `watch(count, (newVal) => { ... })` |
| **生命周期** | `mounted() { ... }` | `onMounted(() => { ... })` |
| **Provide/Inject** | `provide: { key: value }` | `provide(key, value)` |

## 总结

- **Options API** 像是**配置表单**：你填写固定栏目（data、methods），Vue 帮你组织。适合简单场景，但复杂时逻辑碎片化。
- **Composition API** 像是**搭积木**：你导入函数（ref、computed），按功能自由组装。学习曲线稍陡，但可维护性和复用性远超前者。

Vue 3 中两者共存，但官方推荐新项目**优先使用 `<script setup>` + Composition API**，它代表了 Vue 生态的未来方向。
