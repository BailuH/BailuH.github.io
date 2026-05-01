---
title: DOM
createTime: 2026/05/01 20:27:07
permalink: /notes/cs/y2bt9nsi/
---
*(以下内容来源于Kimi K2.6)*

**DOM** 是 **Document Object Model**（**文档对象模型**）的缩写。

它是浏览器在解析 HTML 文档时创建的一种**树形数据结构**，把网页中的每一个标签、属性、文本都看作一个**对象（节点）**，从而让 JavaScript 等编程语言能够动态地读取、修改、添加或删除网页内容。

### 核心要点

| 概念 | 说明 |
|------|------|
| **树形结构** | 整个文档是一个 `document` 根节点，下面分出 `<html>`，再分出 `<head>`、`<body>`，层层嵌套形成父子关系。 |
| **节点（Node）** | 元素节点（标签）、文本节点、属性节点、注释节点等。 |
| **操作接口** | JavaScript 通过 DOM API（如 `getElementById`、`appendChild`、`addEventListener`）来操作这些节点。 |
| **动态更新** | 修改 DOM 后，浏览器会重新渲染（Reflow/Repaint），页面内容随之改变。 |

### 简单示例

```html
<p id="demo">Hello</p>
<script>
  // 通过 DOM 找到该元素对象，修改其文本
  document.getElementById("demo").textContent = "World";
</script>
```

### 一句话总结

> DOM 是网页的**编程接口**：浏览器把 HTML 翻译成一棵对象树，开发者用代码操作这棵树，就能控制页面上显示什么、如何响应用户。