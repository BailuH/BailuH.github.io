---
title: MongoDB简介
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/dptr527z/
---
`MongoDB`属于==NOSQL==数据库，它组织数据的方式与传统的关系型数据库不太一样，提供了一种更简单，更符合人类直观的存储策略：
- MongoDB的基本数据对象称为**文档**（Document），数据结构类似于*JSON、JS的对象、Python的字典类型*，是一组键值对的形式(事实上它是一个被称为`BSON`的数据结构)。
- 若干**文档**组合起来称为**集合**（Collection）
- 而若干**集合**组合起来称为**数据库**（Database）

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260405182519838.png)

## Pymongo
### 连接数据库
要与MongoDB数据库建立连接，需要两个要素：
1. 连接URI（连接字符串）
2. 一个`MongoClient`或者`AsyncMongoClient`对象，从`pymongo`直接引入。

此外MongoDB数据库本身，可以官网下载数据库，也可以用Docker拉取镜像，个人偏好后者。
**连接字符串**的格式很简单

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260405192326115.png)

但是基本上只需要用到前面的协议名和主机号与端口号就可以成功建立连接，并且可选地指定账号密码。对于创建的Docker容器，基本上使用`mongodb://localhost:27017`就可以了。

### 实现CRUD操作
<iframe width="560" height="315" src="https://www.youtube.com/embed/UpsZDGutpZc?si=1aZ2UedG5dMKYXwq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> `pymongo` 原本只是一个同步的框架，为了处理异步请求，还诞生了一个与之兼容的异步库 `motor`。不论是`pymongo`还是`motor`，都属于**ODM**（对象文档映射器），但是`motor`宣布即将（2026/5/14）被弃用，原因是`pymongo` 已经正式支持异步驱动了。
> `beanie`是基于`motor`开发的另一个**ODM**，在简单的CRUD场景代码量会小很多。

有一些好用的`beanie`方法：
1. [查询操作](https://beanie-odm.dev/tutorial/finding-documents/#finding-documents)

| 方法名        | 函数签名                                                                                                               | 用途说明                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `find_one` | `find_one(*args, projection_model=None, session=None, **pymongo_kwargs) -> Findone[Document]`                      | 查找单个文档，返回第一个匹配的 Document 实例或 None。支持投影模型返回部分字段。                 |
| `find`     | `find(*args, projection_model=None, skip=None, limit=None, sort=None, session=None, **pymongo_kwargs) -> FindMany` | 查找多个文档，返回 `FindMany` 查询构建器对象，支持链式调用（`.to_list()`、`.count()` 等）。 |
| `find_all` | `find_all() -> FindMany`                                                                                           | 查找集合中所有文档，等价于 `find({})`，返回全部数据的查询构建器。                          |
| `get`      | `get(document_id: Any, projection_model=None, session=None, **pymongo_kwargs) -> Optional[DocumentType]`           | 通过主键（`_id`）获取单个文档，是最快的查找方式，内部使用 `find_one({"_id": id})`。        |
| `count`    | `count() -> int`                                                                                                   | 统计符合条件的文档数量，通常在链式调用中使用（`await User.find(条件).count()`）。          |
| `exists`   | `exists() -> bool`                                                                                                 | 检查是否存在符合条件的文档，返回布尔值，比 `count() > 0` 更高效。                        |
| `distinct` | `distinct(key: str, **kwargs) -> List[Any]`                                                                        | 获取指定字段的去重值列表，类似 SQL 的 `SELECT DISTINCT`。                        |

当使用 `find()` 或 `find_all()` 后，返回的**查询构建器**（`FindMany` 对象）支持以下链式方法：

| 链式方法      | 函数签名                                                          | 用途说明                                                                 |
| --------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `to_list` | `to_list(length: Optional[int] = None) -> List[DocumentType]` | 执行查询并将结果转为列表，`length` 限制返回数量（None 表示全部）。                             |
| `sort`    | `sort(*args) -> FindMany`                                     | 链式添加排序条件，如 `.sort(User.created_at, -1)` 或 `.sort(-User.created_at)`。 |
| `skip`    | `skip(n: int) -> FindMany`                                    | 链式设置跳过前 n 条记录，用于分页。                                                  |
| `limit`   | `limit(n: int) -> FindMany`                                   | 链式设置最多返回 n 条记录。                                                      |
| `project` | `project(projection_model: Type[BaseModel]) -> FindMany`      | 链式设置投影模型，限制返回的字段。                                                    |
```python
# 注册的接口实现示例
@router.post("/register", response_model=UserDocument)
async def register_user(body: RegisterRequestBody):
    """创建新用户"""
    # 检查 username 和 email 是否已被占用
    existing_user = await UserDocument.find_one(UserDocument.email == body.email)

    print(f"[DEBUG] 查询结果: {existing_user}")
    print(f"[DEBUG] 类型: {type(existing_user)}")
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email {body.email} already registered",
        )
    existing_user = await UserDocument.find_one(UserDocument.username == body.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username {body.username} already registered",
        )

    user = UserDocument(
        username=body.username,
        password_hash=get_password_hash(body.password),
        email=body.email,
        disabled=False,
        created_at=datetime.now(UTC),
    )
    await UserDocument.insert_one(user)
    return user
```
这里我们打印一下关于`existing_user`的日志，由此我们可以分别确定在注册时唯一性检测的两种不同情况的返回值究竟是什么，当用户注册的账号与数据库的用户名和邮箱均不相同时：
```bash
[DEBUG] 查询结果: None
[DEBUG] 类型: <class 'NoneType'>
INFO   127.0.0.1:50389 - "POST /register HTTP/1.1" 200
```
当用户的输入与数据库中`find_one`的返回值均不同时，会直接返回一个`None`对象
```shell
[DEBUG] 查询结果: id=ObjectId('69d25ada3c375f6cc852db6e') username='bailu1' email='bailu1@example.com' role=None disabled=False created_at=datetime.datetime(2026, 4, 5, 12, 51, 38, 733000) updated_at=None password_hash='$2b$12$W5UkOXwVk4Y0ndkHhOgyKeJpbSsUQfDQvvo./U8EwgfQ05M6MsccK' avatar_url='https://cdn-icons-png.flaticon.com/512/149/149071.png' revision_id=None
[DEBUG] 类型: <class 'blogapp.modules.users.models.UserDocument'>
INFO   127.0.0.1:54441 - "POST /register HTTP/1.1" 400
```
这里的后端日志显示类型是我的源代码的一个自定义类，但实际上这个类继承自`Beanie`的`Document`。也就是说，`find_one`方法在给定筛选条件下的返回值是`Document`。

2. [定义文档结构](https://beanie-odm.dev/tutorial/defining-a-document/)



> 💡`Beanie`的“全局初始化+隐式绑定“机制
> Beanie的ODM设计的时候，建立数据库连接的时候，需要声明其中包含的**集合**（Collection）名，而被声明的集合则会**隐式地**在设定`Settings`中设置对应数据库的名称。因此在之后的数据库操作过程中，但凡是被隐式绑定的集合都不需要再指定数据库对应的实例化对象，避免每个数据库操作都要传`db`参数。
> ![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260405213608751.png)



