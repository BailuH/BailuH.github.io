# Mamba 常用命令速查表
&gt; 兼容 Conda，加速下载，适用于 Conda-forge 及 Bioconda 等科学计算通道。

## 1 安装与配置
| 任务 | 命令 |
|---|---|
| 安装 mamba | `conda install mamba -n base -c conda-forge` |
| 设置国内镜像 | `mamba config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge` |

## 2 环境管理
| 任务 | 命令 |
|---|---|
| 创建环境 | `mamba create -n <env> python=3.11` |
| 激活环境 | `mamba activate <env>` |
| 退出环境 | `mamba deactivate` |
| 删除环境 | `mamba env remove -n <env>` |
| 列出所有环境 | `mamba env list` |

## 3 包管理
| 任务 | 命令 |
|---|---|
| 安装包 | `mamba install <pkg>` |
| 指定通道 | `mamba install <pkg> -c conda-forge` |
| 卸载包 | `mamba remove <pkg>` |
| 更新包 | `mamba update <pkg>` |
| 更新全部 | `mamba update --all` |
| 按文件安装 | `mamba install --file requirements.txt` |
| 查看依赖树 | `mamba repoquery whoneeds <pkg>` |

## 4 环境复现
| 任务 | 命令 |
|---|---|
| 导出环境 | `mamba env export > env.yml` |
| 重建环境 | `mamba env create -f env.yml` |

## 5 缓存与清理
| 任务 | 命令 |
|---|---|
| 清理索引缓存 | `mamba clean -i` |
| 清理未使用包 | `mamba clean -p` |
| 一键全清 | `mamba clean -afy` |