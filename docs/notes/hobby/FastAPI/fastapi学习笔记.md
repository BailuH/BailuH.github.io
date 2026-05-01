---
title: fastapi学习笔记
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/gtst08li/
---
## 第一步：接口（endpoint）的基本组件
![[fastapi的第一步]]
在后端开发中，我们常说的“接口”（endpoint），在Web开发的语境下，一般指的就是==API的访问路径==，即一个非常具体的URL路径。它通常由`域名（服务器地址）+路径`组成，每一个接口都对应服务器上的`一种特定资源或操作`。
在FastAPI框架中，写一个接口（endpoint）很简单，只需要：
- 一个FastAPI（这里指的是一个`Python类`）的实例化对象
- 规定一个路径操作，FastAPI遵循的是`RESTful`的接口规范
- 写好一个路径，这里的路径的一些特性很像Python中的格式化字符串
- 以及路径操作函数，由于FastAPI的特性，一般我们会写成异步函数。
---
## 关键概念：怎么写好一个接口？
>这一部分，我们重点关注几个概念，理解好这些概念的用途，是了解fastapi接口的工作原理的重要方式。这些概念都作用于上述接口的基本组件之上，并且不一定是`一对一`的关系。
>需要重点理解的概念有：<u>接口实例化对象、路径参数、查询参数、请求体/响应体、Cookie参数、Header参数、响应状态码与异常（错误）处理、依赖项</u>

### 接口实例化对象
代码一般类似这样，我们只需要掌握几个常用的参数配置
```python
# Initialize FastAPI
app = FastAPI(
    title="Digital Court API",
    version="0.1.0",
    description="WebSocket API for AI-powered courtroom simulation",
    lifespan=lifespan,
)
```
先说一些元数据：
- `title`：API 的标题。它将被添加到生成的 OpenAPI (例如在 `/docs` 中可见)。
- `version`：API的版本号，这是应用程序的版本，而不是 OpenAPI 规范的版本或 FastAPI 的使用版本。
- `description`：API的描述信息，可以使用markdown语法。

其次，有一个关键参数`lifespan`，用于控制应用程序的==生命周期==。而所谓的==生命周期==，其实面向的是这么一类场景：我们在编写接口的时候，可能会希望服务器在接收并处理请求之间先完成一系列操作，例如*建立数据连接、写日志、消息队列redis、应用设置初始化、身份核验等等*，也可能希望断开客户端连接之前完成一系列操作。这个时候就需要用到`lifespan`。**以请求访问数据库为例**，如果不使用`lifespan`，或许可能要每一次调用接口的时候都得建立一次数据库连接与关闭，有了这个参数我们就可以建立一个全局的数据库连接池，然后供整个应用程序使用。

这个参数的运作方式类似于给我们的uvicorn应用暴露两个==钩子==，让我们根据自己的情况编写两个函数来控制应用开始和结束前需要做的事。在已经**弃用**的`startup`和`shutdown`事件中就是这个思路。代码可能长这个样子：
```PYTHON
from fastapi import FastAPI

app = FastAPI()

items = {} 


@app.on_event("startup")   # 写一个特殊的事件装饰器
async def startup_event():
    items["foo"] = {"name": "Fighters"}
    items["bar"] = {"name": "Tenders"}

@app.on_event("shutdown")  # 同样是特殊的事件装饰器 
def shutdown_event():
	with open("log.txt", mode="a") as log: 
		log.write("Application shutdown")

@app.get("/items/{item_id}")
async def read_items(item_id: str):
    return items[item_id]
```
 在这种旧写法中有一个问题，就是`startup`事件和`shutdown`事件之间是独立的，但事实上我们经常要在关闭连接的时候使用到建立连接的变量之类的东西。因此，与其是将它们看作*一个个“分立”的事件*，新版写法将整个过程抽象为应用程序的==生命周期==，用一个（异步）上下文管理统一管理。

因此，`lifespan`参数接受的是一个异步上下文管理器，用`@asynccontextmanager`装饰器修饰一个异步函数来进行。大概长下面这样：
```python
@asynccontextmanager 
async def lifespan(app: FastAPI): 
	# Load the ML model 
	ml_models["answer_to_everything"] = fake_answer_to_everything_ml_model
	yield 
	# Clean up the ML models and release the resources 
	ml_models.clear()
```
 这个**生命周期函数**很明显被`yield`关键字分割为两部分，前一部分对应的是`startup`事件，后一部分对应的是`shutdown`事件。

此外，我们知道在Python中，上下文管理器可以用`with`语句书写，在生产环境中，这个上下文管理器只需要传参给一个fastapi应用实例，uvicorn自动管理。在测试环境中，我们可以使用`TestClient`和`with`语句来使用。
```python
'''
这段代码的核心逻辑是：验证 `lifespan` 确实在 `with TestClient` 语句执行时“开机”，
在语句结束时“关机”。
'''
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.testclient import TestClient

items = {}   # 开机前为空


@asynccontextmanager
async def lifespan(app: FastAPI):
    items["foo"] = {"name": "Fighters"}
    items["bar"] = {"name": "Tenders"}
    yield
    # clean up items
    items.clear()


app = FastAPI(lifespan=lifespan)


@app.get("/items/{item_id}")
async def read_items(item_id: str):
    return items[item_id]


def test_read_items():
    # lifespan严格作用在with缩进块，因此这里一定是空字典
    assert items == {}

    with TestClient(app) as client:
        # 进入with缩进块后做的第一件事是执行生命周期函数yield前的代码
        assert items == {"foo": {"name": "Fighters"}, "bar": {"name": "Tenders"}}

        response = client.get("/items/foo")
        assert response.status_code == 200
        assert response.json() == {"name": "Fighters"}

        # 还在缩进块里，因此请求结束了items还是保持着
        assert items == {"foo": {"name": "Fighters"}, "bar": {"name": "Tenders"}}

    # with缩进块结束，自动执行了生命周期函数yield后面的代码，清除了item字典。
    assert items == {}
```
 
## 配合数据库使用：

## 数据验证与字段扩展：fastapi里的Pydantic使用


## 多模态的数据流动：表单类型与文件类型

## 安全性：

## 更多的问题：视情况决定应用场景
### CORS跨域资源共享
>CORS指的是Cross-Origin-Resource-Sharing，其中比较关键的概念是==源Origin==，==源==是协议 (`http`, `https`)、域名 (`myapp.com`, `localhost`, `localhost.tiangolo.com`) 和端口 (`80`, `443`, `8080`) 的组合。

在全栈开发的场景之下，前端要与后端通信，需要配置一下==中间件Middleware==，代码示意如下：
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://.tiangolo.com",
    "https://.tiangolo.com",
    "https://",
    "https://:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def main():
    return {"message": "Hello World"}
```