<iframe width="560" height="315" src="https://www.youtube.com/embed/upu_TeZImN0?si=gBYwpRXMJ69XyEFK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


>💡计算理论与自动机理论（Theory of Computation & Automata Theory）


## 正则表达式的定义

**正则表达式是一种代数表示法**，用于描述**字符串集合**（即语言）。它不是直接列出所有字符串，而是通过规则"生成"这些字符串。
它利用五条规则进行一种递归的定义，包含基础情形（第1条）、递归条件（2-4条），第5条是总结。

![](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260313150134030.png)

>🤔  $\phi与\varepsilon$ 的区别以及其存在性——*更进一步思考*
>从**集合**的角度来说，$\phi$ 表示空集，集合中的元素数是0；$\varepsilon$ 表示空串，集合中的元素数目为1。
>从抽象代数的角度来说，正则表达式也是一种（抽象）代数，具体来说称为==Kleene代数==。
>为什么要同时存在 $\phi与\varepsilon$ ？——Kleene代数运算的==封闭性与完整性==。

[Kleene代数介绍](https://www.youtube.com/watch?v=TEFx5DG9ghE)
- 公理
- 乔姆斯基层级结构（Chomsky hierarchy）
- 正则表达式的组成/形式定义
- DFA有限状态机 
## 正则表达式的代数恒等式

由于正则表达式实质上是一个集合，我们可以通过集合的一些方法证明一些正则表达式的代数恒等式。
### 

![](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260313150508258.png)
