# uv 常用命令速查表
> Rust 编写的极速 Python 工具链，集成包管理、虚拟环境、构建与发布。


```bash
# 我常用的命令
uv init
uv add pandas  / uv add "fastapi[standard]"
uv lock

source .venv/bin/activate
uv pip list
uv pip list --outdated
uv pip freeze
```
## 1 安装与升级
| 任务 | 命令 |
|---|---|
| 一键安装（Linux/macOS） | `curl -LsSf https://astral.sh/uv/install.sh | sh` |
| Windows 安装 | `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"` |
| pip 安装 | `pip install uv` |
| 升级到最新版 | `uv self update` |

## 2 虚拟环境
| 任务             | 命令                          |
| -------------- | --------------------------- |
| 创建（默认 `.venv`） | `uv venv`                   |
| 指定 Python 版本   | `uv venv --python 3.11`     |
| 指定路径           | `uv venv .venv310`          |
| 激活（类 Unix）     | `source .venv/bin/activate` |
| 激活（Windows）    | `.venv\Scripts\activate`    |
| 删除环境           | 直接 `rm -rf .venv` 即可        |

## 3 依赖管理（项目级）
| 任务 | 命令 |
|---|---|
| 初始化项目 | `uv init` |
| 安装包并写入 `pyproject.toml` | `uv add <pkg>` |
| 安装开发依赖 | `uv add --dev pytest` |
| 按 `requirements.txt` 导入 | `uv add -r requirements.txt` |
| 卸载包 | `uv remove <pkg>` |
| 更新锁文件 | `uv lock` |
| 同步环境 | `uv sync` |
| 更新全部依赖 | `uv lock --upgrade && uv sync` |

## 4 运行脚本 / REPL
| 任务 | 命令 |
|---|---|
| 直接运行脚本 | `uv run python main.py` |
| 临时指定 Python 版本 | `uv run -p 3.12 python main.py` |
| 无需激活安装并执行 | `uv run --with rich python -m rich` |
| 启动即时 REPL | `uv run python` |

## 5 查看与检查
| 任务 | 命令 |
|---|---|
| 查看依赖树 | `uv tree` |
| 查看过时包 | `uv lock --upgrade` 后对比 |
| 检查项目合规 | `uv build` 前自动检查 |

## 6 构建 & 发布
| 任务 | 命令 |
|---|---|
| 构建 wheel/sdist | `uv build` |
| 发布到 PyPI | `uv publish` |
| 指定仓库 | `uv publish --index https://test.pypi.org/legacy/` |

## 7 缓存维护
| 任务 | 命令 |
|---|---|
| 查看缓存位置 | `uv cache dir` |
| 清理全部缓存 | `uv cache clean` |
| 垃圾回收（保留最新） | `uv cache prune` |

## 8 常用全局配置
| 任务                 | 命令                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 设置国内镜像             | `uv pip install -i https://pypi.tuna.tsinghua.edu.cn/simple <pkg>`                                                              |
| 写入`pyproject.toml` | ```[[tool.uv.index]]<br>name = "tuna"  # 可选，但建议给名字<br>url = "https://pypi.tuna.tsinghua.edu.cn/simple"<br>default = true```<br> |
| 禁用缓存（一次性）          | `uv run --no-cache python main.py`                                                                                              |