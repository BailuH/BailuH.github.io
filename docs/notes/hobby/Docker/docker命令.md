---
title: docker命令
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/jtet6nnj/
---

```bash
### ==容器操作== ###
# 端口映射（port mapping）
docker run -p 80:80 nginx 

# 在后端从镜像构建容器并启动（而不占用shell程序）
docker run -p 5000:80 -d nginx  # 会返回正在运行的容器id
# 首次启动容器时可以指定容器名
docker run -p 5000:80 -d nginx --name my-nginx

# 展示本机上的所有运行容器（-a 参数会展示停止运行的））
docker ps [-a]

# 启动本机已有容器
docker start [容器ID/容器名]
# 关闭本机已有容器
docker stop [容器ID/容器名]


### ==镜像操作== ###
# 展示本机上所有的Docker镜像
docker image ls [--digest]
# 仅拉取镜像而不创建容器
docker pull postgres
# 指定拉取镜像的标签和摘要（tags and digests）
docker pull postgres:16-alpine
docker pull postgres[:16-alpine]@sha256:4327b9fd295502f326f44153a1045a7170ddbfffed1c3829798328556cfd09e2

# 指定环境变量和参数

# 镜像瘦身（slim & alpine images）

# 调试正在运行的容器


```