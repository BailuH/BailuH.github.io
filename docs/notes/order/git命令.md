---
title: git命令
createTime: 2026/05/01 20:44:43
permalink: /notes/order/c469rf74/
---
Git 常用命令速查表  
![](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260304175030002.png)

--------------------------------
1. 首次配置
```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main    # 新仓库默认分支名
git config --global core.autocrlf true         # Windows 推荐
```

2. 本地仓库初始化
```bash
git init                # 新建空仓库
git add .               # 把所有改动放进暂存区
git commit -m "feat: first commit"
```

3. 连接远程仓库
```bash
git remote add origin <URL>        # HTTPS 或 SSH
git remote -v                      # 查看已配置的远程
```

4. 推送 & 拉取
```bash
git push -u origin main            # 第一次推送并建立跟踪
git push                           # 后续直接 push
git pull origin main               # 抓取远程最新并合并
git pull origin main --rebase      # 用 rebase 保持线性历史
```

5. 分支操作
```bash
git branch                  # 列出本地分支
git branch -M main          # 强制重命名当前分支为 main
git checkout -b dev         # 新建并切换到 dev 分支
git merge dev               # 把 dev 合并进当前分支
```

6. 查看状态 & 历史
```bash
git status                  # 工作区/暂存区状态
git log --oneline --graph   # 单行+图形化历史
git diff                    # 工作区 vs 暂存区
git diff --staged           # 暂存区 vs 最新提交
```

7. 撤销与回退
```bash
git restore <file>          # 丢弃工作区改动
git restore --staged <file> # 把文件从暂存区撤出
git reset --hard <commit>   # 回退到某提交（危险）
git commit --amend          # 修改最后一次提交信息/内容
```

8. 其他高频技巧
```bash
git add --renormalize .     # 重新应用换行符规则
git commit --no-verify      # 跳过 pre-commit hooks
git push --force-with-lease # 安全强推
git clone <URL>             # 克隆远程仓库到本地
```

--------------------------------
一行搞定「初始化-提交-推送」模板  
（适合空文件夹 → GitHub 空仓库场景）
```bash
git init
git add .
git commit -m "feat: initial scaffold"
git branch -M main
git remote add origin git@github.com:USER/REPO.git
git push -u origin main
```

把这张表贴到 `.md` 或打印出来，随用随查即可。

git reset --hard origin/main && git clean -fd
直接让本地与 GitHub 完全一致，任何本地修改全部清除。