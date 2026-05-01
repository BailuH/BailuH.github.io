Docker采用的是经典的**C-S架构**，客户端通过REST API和服务器端进行通信。
服务器端又称作Docker引擎，负责构建和运行**容器**（**container**），但从技术实现上讲，所谓容器其实也只是运行在主机操作系统上的一个**进程**（**process**）。但这个进程与普通进程==略有不同==：
- 普通进程能看到整个操作系统的资源（所有其他进程、网络接口、文件系统等），而容器进程通过`Linux Namespaces` 被隔离在一个独立的"视图"中.
- 普通进程可以自由竞争系统资源（CPU、内存、磁盘 I/O），可能耗尽整台机器。容器通过 **Cgroups（Control Groups）** 被施加硬性限制：
- 拥有自己独立的文件系统。

| 特性        | 普通进程            | 容器进程                            |
| --------- | --------------- | ------------------------------- |
| **资源可见性** | 全局可见            | Namespace 隔离，局部视图               |
| **资源限制**  | 软限制（ulimit 可突破） | 硬限制（Cgroups 强制执行）               |
| **文件系统**  | 直接修改宿主          | 层叠镜像，写时复制                       |
| **生命周期**  | 独立存在            | 由容器运行时（containerd/dockerd）管理    |
| **可移植性**  | 依赖宿主环境          | 打包依赖，一次构建到处运行                   |
| **安全边界**  | 依赖用户权限          | 多层防护（Namespace+Cgroups+Seccomp） |


![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260330171905672.png)

容器之间虽然是一个相互隔离的环境，但是与虚拟机不同的是，它们需要共享同一个**操作系统内核**（Kernel），每个操作系统的内核都不尽相同，这意味着不同操作系统之间的应用程序接口（API）是不同的，==这意味着不同操作系统构建的容器彼此是无法相互移植的，因为能够运行容器的内核是不同的==。

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260330173819103.png)

> ❓关于Windows的linux内核
> WSL 2 是安装 Linux 发行版时的默认发行类型。WSL 2 利用虚拟化技术在轻量级实用虚拟机（VM）内运行 Linux 内核。Linux 发行版在 WSL 2 管理的虚拟机内作为隔离容器运行。通过 WSL 2 运行的 Linux 发行版将共享相同的网络命名空间、设备树（除 `/dev/pts` 外）、CPU/内核/内存/交换空间、 `/init` 二进制文件，但拥有各自的 PID 命名空间、挂载命名空间、用户命名空间、Cgroup 命名空间和 `init` 进程。[微软的wsl2文档](https://learn.microsoft.com/en-us/windows/wsl/about)

从Windows10起，就可以很明显地看出微软的策略倾斜——逐步拥抱Linux生态，除非依赖 Windows 特定 API、COM 组件或注册表，否则构建Linux容器才是最佳选择。因为现代云原生生态（Kubernetes、微服务等）几乎都是基于 Linux 的。
于是现在Windows安装的Docker Desktop默认启用的是wsl2的引擎，在win下安装Docker官方给的最佳实践也是要先安装wsl2。不过还是要说清楚，目前的Docker Desktop还是可以支持Windows容器的，这对于一些运行传统的 `.NET Framework 3.5/4.x 应用`或者`SQL Server Windows`应用（与Linux版本的SQL Server是不同的镜像）是有帮助的。

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260330175227540.png)






