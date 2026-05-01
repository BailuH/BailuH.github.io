/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '我的博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
  {
    text: '我的笔记',
    items: [
      { text: '笔记说明指南', link: '/notes/2drtdmjr/' },
      { text: '泛法学', link: '/notes/law/jvgpjise/' },
      { text: '泛计算机技术', link: '/notes/cs/6vx8fvln/' },
      { text: '兴趣计算机知识', link: '/notes/hobby/gtst08li/' },
      { text: '数学', link: '/notes/math/gz42cc1m/' },
      { text: '一些通识', link: '/notes/general/ckz4g36j/' },
      { text: '常见指令合集', link: '/notes/order/c469rf74/' },
    ]
  },
])
