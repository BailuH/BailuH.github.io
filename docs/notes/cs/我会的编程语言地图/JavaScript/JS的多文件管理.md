---
title: JS的多文件管理
createTime: 2026/05/01 20:27:07
permalink: /notes/cs/ddeh9ztx/
---
（以下内容来源于Kimi，暂未甄别）

根据 MDN 官方文档，我为你整理了以下 JavaScript 模块导入语法与多文件管理学习笔记：

---

# JavaScript 模块导入语法与多文件管理学习笔记（基于 MDN 官方文档）

## 一、模块基础概念

### 1.1 什么是模块
- **模块（Module）**：将 JavaScript 程序拆分为可按需导入的单独文件
- 现代浏览器原生支持，无需转译
- 模块自动使用**严格模式**
- 模块自动延迟加载（无需 `defer` 属性）

### 1.2 文件扩展名选择

| 扩展名 | 优点 | 缺点 |
|--------|------|------|
| `.js` | 兼容性好，服务器普遍支持 | 无法一眼区分模块与普通脚本 |
| `.mjs` | 清晰标识模块文件，Node.js 推荐 | 部分服务器需额外配置 MIME 类型 |

**MDN 建议**：为学习和代码可移植性，使用 `.js` 扩展名

### 1.3 基本项目结构示例

```
project/
├── index.html
├── main.js          # 入口模块
└── modules/
    ├── canvas.js    # 画布功能模块
    └── square.js    # 正方形绘制模块
```

---

## 二、导出（Export）

### 2.1 具名导出（Named Export）

**方式一：内联导出**
```javascript
// square.js
export const name = "square";

export function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, length, length);
  return { length, x, y, color };
}

export class Square {
  // ...
}
```

**方式二：底部批量导出**
```javascript
// square.js
const name = "square";

function draw(ctx, length, x, y, color) {
  // ...
}

function reportArea(length) {
  // ...
}

// 在文件末尾统一导出
export { name, draw, reportArea };
```

### 2.2 默认导出（Default Export）

```javascript
// square.js
function randomSquare() {
  // 创建随机正方形
}

// 方式一：底部导出
export default randomSquare;

// 方式二：内联匿名函数导出
export default function (ctx) {
  // ...
}
```

**特点**：
- 每个模块只能有一个默认导出
- 导入时无需使用大括号
- 可以导出匿名函数

### 2.3 导出重命名

```javascript
// 导出时重命名
export { 
  function1 as newFunctionName,
  function2 as anotherNewFunctionName 
};
```

---

## 三、导入（Import）

### 3.1 基本导入语法

```javascript
// 具名导入（使用大括号）
import { name, draw, reportArea } from "./modules/square.js";

// 默认导入（不使用大括号）
import randomSquare from "./modules/square.js";

// 等价于
import { default as randomSquare } from "./modules/square.js";
```

### 3.2 导入重命名（避免命名冲突）

```javascript
// 当多个模块有同名导出时
import {
  name as squareName,
  draw as drawSquare,
  reportArea as reportSquareArea
} from "./modules/square.js";

import {
  name as circleName,
  draw as drawCircle,
  reportArea as reportCircleArea
} from "./modules/circle.js";
```

### 3.3 命名空间导入（模块对象）

```javascript
// 将所有导出聚合到模块对象中
import * as Square from "./modules/square.js";
import * as Circle from "./modules/circle.js";

// 使用方式
const square1 = Square.draw(myCanvas.ctx, 50, 50, 100, "blue");
Square.reportArea(square1.length, reportList);

const circle1 = Circle.draw(myCanvas.ctx, 75, 200, 100, "green");
Circle.reportArea(circle1.radius, reportList);
```

**优点**：代码更整洁，避免命名冲突

### 3.4 混合导入（默认 + 具名）

```javascript
import randomSquare, { name, draw } from "./modules/square.js";
```

---

## 四、在 HTML 中使用模块

### 4.1 外部模块脚本

```html
<!-- 必须添加 type="module" -->
<script type="module" src="main.js"></script>
```

### 4.2 内联模块脚本

```html
<script type="module">
  import { draw } from "./modules/square.js";
  draw(ctx, 100, 50, 50, "blue");
</script>
```

### 4.3 重要注意事项

| 特性 | 模块脚本 | 经典脚本 |
|------|---------|---------|
| `type` 属性 | `type="module"` | 无或 `type="text/javascript"` |
| 严格模式 | 自动启用 | 需手动添加 `"use strict"` |
| 延迟加载 | 自动延迟 | 需添加 `defer` |
| 全局作用域变量 | 模块内不自动创建全局变量 | 自动创建全局变量 |
| CORS 要求 | 必须通过服务器访问（`file://` 会报错） | 本地文件可运行 |

---

## 五、导入映射（Import Maps）

### 5.1 基本用法

允许使用**裸模块名称**（如 Node.js 中的 `lodash`）导入模块：

```html
<script type="importmap">
{
  "imports": {
    "square": "./modules/square.js",
    "shapes/square": "./modules/shapes/square.js",
    "lodash": "/node_modules/lodash-es/lodash.js"
  }
}
</script>
```

```javascript
// 现在可以使用裸名称导入
import { name as squareName } from "square";
import _ from "lodash";
```

### 5.2 路径前缀映射

```html
<script type="importmap">
{
  "imports": {
    "lodash": "/node_modules/lodash-es/lodash.js",
    "lodash/": "/node_modules/lodash-es/",
    "https://www.unpkg.com/moment/": "/node_modules/moment/"
  }
}
</script>
```

```javascript
// 导入整个包
import _ from "lodash";

// 导入包内模块
import fp from "lodash/fp.js";

// 重映射 CDN URL 到本地
import moment from "https://www.unpkg.com/moment/moment.js";
```

### 5.3 域限模块（Scopes）- 版本管理

```html
<script type="importmap">
{
  "imports": {
    "cool-module": "/node_modules/cool-module/index.js"
  },
  "scopes": {
    "/node_modules/dependency/": {
      "cool-module": "/node_modules/some/other/location/cool-module/index.js"
    }
  }
}
</script>
```

**作用**：不同路径的脚本可以使用不同版本的同一模块

### 5.4 缓存优化（去除哈希文件名）

```html
<script type="importmap">
{
  "imports": {
    "main_script": "/node/srcs/application-fg7744e1b.js",
    "dependency_script": "/node/srcs/dependency-3qn7e4b1q.js"
  }
}
</script>
```

**优势**：脚本文件变化时只需更新映射，无需修改源代码

### 5.5 特性检测

```javascript
if (HTMLScriptElement.supports?.("importmap")) {
  console.log("浏览器支持导入映射。");
}
```

---

## 六、动态导入（Dynamic Import）

### 6.1 基本语法

```javascript
// 返回 Promise
import("./modules/mymodule.js").then((module) => {
  // 使用模块
  module.default();
  module.someFunction();
});
```

### 6.2 async/await 语法

```javascript
const module = await import("./modules/mymodule.js");
module.someFunction();
```

### 6.3 实际应用场景

```javascript
// 按需加载模块（懒加载）
circleBtn.addEventListener("click", () => {
  import("./modules/circle.js").then((Module) => {
    const circle1 = new Module.Circle(ctx, listId, 75, 200, 100, "green");
    circle1.draw();
  });
});
```

**特点**：
- 可以在任何脚本中使用（包括非模块脚本）
- 返回 Promise，支持异步加载
- 可以实现代码分割和懒加载

---

## 七、模块聚合（Barrel Pattern）

### 7.1 合并子模块

```javascript
// shapes.js - 聚合模块
export { Square } from "./shapes/square.js";
export { Triangle } from "./shapes/triangle.js";
export { Circle } from "./shapes/circle.js";
```

### 7.2 使用聚合模块

```javascript
// 之前需要多行导入
import { Square } from "./modules/square.js";
import { Circle } from "./modules/circle.js";
import { Triangle } from "./modules/triangle.js";

// 现在只需一行
import { Square, Circle, Triangle } from "./modules/shapes.js";
```

**项目结构**：
```
modules/
├── canvas.js
├── shapes.js      # 聚合模块
└── shapes/
    ├── circle.js
    ├── square.js
    └── triangle.js
```

---

## 八、顶层 Await（Top-level Await）

### 8.1 基本用法

模块可以像异步函数一样使用 `await`：

```javascript
// getColors.js
const colors = fetch("../data/colors.json").then((response) => response.json());

export default await colors;
```

### 8.2 使用场景

```javascript
// main.js
import colors from "./modules/getColors.js";  // 等待 colors 加载完成

// 直接使用
const square1 = new Square(ctx, listId, 50, 50, 100, colors.blue);
```

**特点**：
- 父模块会等待子模块的异步操作完成
- 不会阻塞兄弟模块的加载
- 适用于配置加载、数据获取等场景

---

## 九、导入非 JavaScript 资源

### 9.1 导入属性（Import Attributes）

```javascript
// 导入 JSON
import colors from "./colors.json" with { type: "json" };

// 导入 CSS
import styles from "./styles.css" with { type: "css" };

// 使用
console.log(colors.map((color) => color.value));
document.adoptedStyleSheets = [styles];
```

**作用**：类型验证，防止意外执行代码

---

## 十、循环导入与依赖管理

### 10.1 循环导入问题

```javascript
// a.js
import { b } from "./b.js";
export const a = 2;

// b.js
import { a } from "./a.js";
console.log(a);  // ReferenceError: Cannot access 'a' before initialization
export const b = 1;
```

### 10.2 解决方案

1. **异步使用导入的值**
```javascript
// b.js
import { a } from "./a.js";
setTimeout(() => {
  console.log(a);  // 2 - 可以正常访问
}, 10);
export const b = 1;
```

2. **重构代码消除循环**
   - 合并两个模块
   - 将共享代码移动到第三个模块
   - 调整代码依赖关系

---

## 十一、同构模块（跨平台兼容）

### 11.1 核心与绑定分离

```
myModule/
├── core.js        # 纯 JavaScript 逻辑（跨平台）
├── browser.js     # 浏览器绑定（DOM 操作）
└── node.js        # Node.js 绑定（文件系统）
```

### 11.2 运行时检测

```javascript
// myModule.js
let password;
if (typeof process !== "undefined") {
  // Node.js 环境
  password = process.env.PASSWORD;
} else if (typeof window !== "undefined") {
  // 浏览器环境
  password = document.getElementById("password").value;
}
```

### 11.3 Polyfill 动态导入

```javascript
if (typeof fetch === "undefined") {
  // Node.js 环境，加载 polyfill
  globalThis.fetch = (await import("node-fetch")).default;
}
```

---

## 十二、最佳实践总结

| 场景     | 推荐做法                           |
| ------ | ------------------------------ |
| 避免命名冲突 | 使用 `import * as Module` 命名空间导入 |
| 大型项目   | 使用导入映射管理模块路径                   |
| 性能优化   | 使用动态导入实现懒加载                    |
| 版本管理   | 使用 `scopes` 实现域限模块             |
| 代码组织   | 使用模块聚合（Barrel Pattern）         |
| 跨平台模块  | 分离核心逻辑与平台绑定                    |
| 缓存优化   | 使用导入映射管理哈希文件名                  |

---

: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules