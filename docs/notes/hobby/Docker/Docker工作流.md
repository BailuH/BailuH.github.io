---
title: Docker工作流
createTime: 2026/05/01 20:28:10
permalink: /notes/hobby/ezkz4583/
---
Docker提供的抽象包括：==镜像（Image）、容器（container）==

## 镜像/Image
Docker镜像是应用程序的打包，将应用程序通过 `Dockerfile` 打包成镜像（Image），镜像中包含了我们应用程序所需的一切，具有高度的可移植性。
一个Docker镜像通常需要包括：
- 一个精简的操作系统（cut-down OS）
- 运行环境，例如node、Python环境等
- 应用程序文件
- 第三方库
- 环境变量

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260330195403770.png)

## 容器/Container
容器是用来运行镜像的“容器”