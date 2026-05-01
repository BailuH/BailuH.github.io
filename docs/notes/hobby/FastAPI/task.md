---
title: task
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/d0bemksl/
---
针对你的“多智能体法庭辩论”项目，这属于 LangGraph 中典型的**多角色状态机（Stateful Multi-Agent）**场景。要支撑这类项目，后端不仅要处理复杂的逻辑状态，还要通过 WebSocket 实现类似“实时弹幕”或“对话流”的效果。

以下是为你量身定制的 **20天 FastAPI + LangGraph 后端开发突击计划**。

---

### 第一阶段：FastAPI 基础与异步思维（Day 1 - Day 5）

**核心目标**：理解异步（Async）如何提高并发性能，掌握 Pydantic 模型。

- **Day 1: 异步 IO 基础（C 程序员视角）**
    
    - **学习目标**：理解事件循环。为什么 `await` 不会阻塞线程。
        
    - **学习材料**：[Python Asyncio 官方文档](https://docs.python.org/3/library/asyncio.html)；FastAPI [Concurrency 章节](https://fastapi.tiangolo.com/async/)。
        
    - **思考问题**：在 C 中用 `pthread` 处理并发和在 Python 中用 `asyncio` 有什么本质区别？
        
- **Day 2: FastAPI 环境与基础路由**
    
    - **学习目标**：在 WSL2 安装 FastAPI/Uvicorn；编写第一个 GET/POST 接口。
        
    - **学习材料**：FastAPI [First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)。
        
    - **思考问题**：如何利用 Unix 的 `uvicorn --reload` 实现高效调试？
        
- **Day 3: Pydantic 数据验证（核心）**
    
    - **学习目标**：定义“辩论请求”和“辩论响应”的数据结构。
        
    - **学习材料**：[Pydantic V2 Guide](https://docs.pydantic.dev/latest/)。
        
    - **思考问题**：Pydantic 如何像 C 的 `struct` 一样约束输入数据，并自动生成 JSON Schema？
        
- **Day 4: 依赖注入 (Dependency Injection)**
    
    - **学习目标**：学习 `Depends`。用于后期注入数据库连接或 LangGraph 对象。
        
    - **学习材料**：FastAPI [Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)。
        
    - **思考问题**：为什么不建议在全局作用域直接实例化大对象？
        
- **Day 5: 异常处理与中间件**
    
    - **学习目标**：捕获业务逻辑中的错误，返回统一的 JSON 错误。
        
    - **学习材料**：FastAPI [Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/)。
        
    - **思考问题**：如何优雅地处理多智能体运行时的超时或崩溃？
        

---

### 第二阶段：LangGraph 深度集成（Day 6 - Day 10）

**核心目标**：将法庭辩论逻辑转化为状态图，并暴露接口。

- **Day 6: LangGraph 核心概念映射**
    
    - **学习目标**：State (状态), Nodes (节点), Edges (边) 的定义。
        
    - **学习材料**：[LangGraph Conceptual Guide](https://langchain-ai.github.io/langgraph/concepts/high_level/)。
        
    - **思考问题**：法庭辩论中的“法官”、“原告”、“被告”如何抽象成三个独立的节点？
        
- **Day 7: 状态持久化 (Persistence)**
    
    - **学习目标**：使用 `SqliteSaver` 保存辩论进度。
        
    - **学习材料**：LangGraph [Persistence Guide](https://langchain-ai.github.io/langgraph/how-tos/persistence/)。
        
    - **思考问题**：如果后端宕机，如何通过 `thread_id` 恢复刚才的辩论？
        
- **Day 8: 多智能体控制流（条件边）**
    
    - **学习目标**：实现法官根据发言决定下一位发言人的逻辑。
        
    - **学习材料**：LangGraph [Multi-agent tutorials](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/multi-agent-collaboration/)。
        
    - **思考问题**：如何设计 Node 之间的 State 传递，以模拟真实的辩论环节？
        
- **Day 9: 配置与 Secrets 管理**
    
    - **学习目标**：使用 `.env` 管理 API Keys。
        
    - **学习材料**：Python-dotenv 或 Pydantic-settings。
        
    - **思考问题**：在 WSL2 环境下，如何安全地注入敏感环境变量？
        
- **Day 10: 接口集成测试**
    
    - **学习目标**：编写一个 POST 接口，触发一次完整的 LangGraph 运行。
        
    - **学习材料**：FastAPI [Testing](https://fastapi.tiangolo.com/tutorial/testing/)。
        
    - **思考问题**：LangGraph 运行是异步的，我的 FastAPI 接口该如何 `await` 它的结果？
        

---

### 第三阶段：WebSocket 实时流式传输（Day 11 - Day 15）

**核心目标**：实现“流式输出”，让用户实时看到智能体一个字一个字地吐出辩词。

- **Day 11: WebSocket 基础**
    
    - **学习目标**：实现简单的双向通信。
        
    - **学习材料**：FastAPI [WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)。
        
    - **思考问题**：WebSocket 和普通的 HTTP 请求在 Unix 网络层有什么区别？
        
- **Day 12: LangGraph 流式输出接口 (`astream`)**
    
    - **学习目标**：学习 `graph.astream()` 生成器。
        
    - **学习材料**：[Streaming responses in LangGraph](https://langchain-ai.github.io/langgraph/how-tos/streaming/)。
        
    - **思考问题**：如何通过 WebSocket 发送 JSON 格式的“流数据包”？
        
- **Day 13: 状态流 vs 令牌流 (Tokens)**
    
    - **学习目标**：不仅推送谁在说话，还要推送说话的内容细节（Token）。
        
    - **学习材料**：LangChain `astream_events` 接口。
        
    - **思考问题**：如何设计消息协议，让前端区分这是“节点切换”还是“文本追加”？
        
- **Day 14: 并发连接管理**
    
    - **学习目标**：维护一个 ConnectionManager，支持多个用户观看同一场辩论。
        
    - **学习材料**：FastAPI WebSocket 示例代码中的 ConnectionManager 类。
        
    - **思考问题**：如果有 100 个人同时连接，WSL2 的系统资源限制（如 ulimit）会影响性能吗？
        
- **Day 15: 前后端联调（Mock 工具）**
    
    - **学习目标**：使用简单 HTML 或 `wscat` 模拟前端接收辩论流。
        
    - **练习**：实现一个能持续接收“法官判决中...”文字流的 Demo。
        

---

### 第四阶段：工程化与优化（Day 16 - Day 20）

**核心目标**：让后端“靠谱”，具备生产环境雏形。

- **Day 16: 数据库集成 (PostgreSQL/SQLAlchemy)**
    
    - **学习目标**：将用户信息和历史辩论记录存入数据库。
        
    - **学习材料**：FastAPI [SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)。
        
- **Day 17: 后台任务 (Background Tasks)**
    
    - **学习目标**：处理辩论后的自动总结、归档等耗时操作。
        
    - **学习材料**：FastAPI [Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)。
        
- **Day 18: 性能监控与日志 (Logging)**
    
    - **学习目标**：在 WSL2 中配置标准的 Python 日志系统。
        
    - **思考问题**：多智能体并发运行时，日志如何区分不同会话（Thread ID）？
        
- **Day 19: 部署与环境隔离（Docker & WSL2）**
    
    - **学习目标**：编写 Dockerfile，将项目容器化。
        
    - **学习材料**：FastAPI [Docker User Guide](https://fastapi.tiangolo.com/deployment/docker/)。
        
- **Day 20: 结项演示与压力测试**
    
    - **学习目标**：模拟法官、原告、被告连轴转，测试系统稳定性。
        
    - **任务**：整理代码架构，确保符合“可用靠谱”的标准。
        

---

### 💡 给你的特别建议：

1. **利用 C 语言思维理解 `State`**：LangGraph 的 `State` 本质上是一个跨函数传递的、受保护的全局 `struct`。在 FastAPI 中，你要确保对这个 `State` 的修改是线程/异步安全的。
    
2. **善用 WSL2**：不要在 Windows 原生环境跑 Python。在 WSL2 中使用 `tmux` 开启两个窗口，一个运行后端，一个用 `tail -f` 监控日志，非常有 Unix 范儿。
    
3. **最快路径**：如果想最快出效果，Day 6-13 是核心。Day 1-5 可以快速扫过，直接进项目边写边查。