---
title: Pydantic
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/imwxgfso/
---
> Pydantic是用来校验数据类型的，是 Python 中使用最广泛的数据验证库。
> 一方面，它可以减轻你写代码的时候，对于程序输入数据的“幻想”（以及为这份幻想所编写的一系列处理数据类型的代码，比方说Python里的`isinstance`），另一方面，Pydantic也是很多其他同样非常重要的库（例如fastapi）的基础。

在官方文档你能看到如下优势：
- 由类型提示驱动——借助 Pydantic，模式验证和序列化由类型注释控制；学习的更少，编写的代码更少，并且与您的 IDE 和静态分析工具集成。
- 速度——Pydantic 的核心验证逻辑是用 Rust 编写的。因此，Pydantic 是 Python 中最快的数据验证库之一。
- JSON 模式——Pydantic 模型可以生成 JSON 模式，从而便于与其他工具进行集成。
- 严格模式和宽松模式——Pydantic 可以在 `strict=True` 模式（数据不进行转换）或 `strict=False` 模式下运行（在适当的情况下，Pydantic 尝试将数据强制转换为正确类型）。
- 数据类、类型字典等——Pydantic 支持对许多标准库类型的验证，包括 `dataclass` 和 `TypedDict` 。了解更多
- 自定义——Pydantic 允许自定义验证器和序列化器以多种强大方式改变数据的处理方式。了解更多……
- 生态系统——PyPI 上约有 8000 个包使用 Pydantic，包括像 FastAPI、 huggingface、Django Ninja、SQLModel 和 LangChain 这样极受欢迎的库。
- 经过实战检验——Pydantic 每月被下载超过 7000 万次，被所有 FAANG 公司以及纳斯达克 25 家最大公司中的 20 家所使用。如果你正试图用 Pydantic 做某事，那么可能其他人已经做过了。

## 关键要点自查：
1. type hinting、type checking、data validation之间的区别与联系

### 