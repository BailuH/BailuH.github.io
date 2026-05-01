---
title: HBase
createTime: 2026/05/01 20:27:07
permalink: /notes/cs/u2lftsn4/
---
## 从`BigTable`说起
**BigTable** 是 Google 开发的**分布式结构化数据存储系统**，发表于 2006 年的 OSDI 论文《*Bigtable: A Distributed Storage System for Structured Data*》。它是 HBase 的直接设计原型，两者在架构和概念上高度相似。
> 🤔关系数据库已经流行了很多年，且又有`HDFS`和`MapReduce`的存在，为什么还需要`Hbase`/`BigTable`?
> 
> 关系数据库的根基建立在**单机事务**的假设之上，ACID 特性与共享存储架构如同一把双刃剑——在保障数据强一致性的同时，也将系统的上限锁死在单台硬件的物理边界内。当数据量突破 TB 级、并发连接突破万级时，纵向扩展（Scale-up）很快触及 CPU、内存与磁盘 I/O 的硬天花板；而试图通过分片（Sharding）实现横向扩展时，跨节点的分布式事务、连接查询与全局一致性又会让应用层代码陷入难以维护的复杂泥潭。更深层的问题在于其**刚性 Schema** 无法优雅容纳半结构化数据（如用户行为日志、IoT 传感器流），每一条新增字段都可能触发全表重写，这在 PB 级数据场景下是不可承受之重。
> 
> HDFS 与 MapReduce 则走向了另一个极端——它们用**高延迟换取高吞吐**，用**不可变性换取容错性**。HDFS 的“一次写入、多次读取”（WORM）设计哲学从根本上排除了高效随机写和原地更新的可能，任何数据修改都只能通过追加新版本并依赖后续批作业合并（Compaction）来完成；而 MapReduce 的作业启动开销（秒级到分钟级）与全量磁盘扫描的范式，决定了它注定服务于离线批处理（如数仓分析、日志挖掘），而非前端业务所需的毫秒级交互。当你需要为亿万用户提供实时的单点查询（如读取某用户的最新画像、写入一条即时消息）时，HDFS/MapReduce 的批处理基因使其在这场延迟竞赛中完全失效——它存储得了 PB 级数据，却回答不了“此刻正在发生什么”的实时追问。


### 核心定位

BigTable 被设计用来处理**海量结构化数据**（PB 级别），在数千台商用服务器上提供**高吞吐、低延迟**的随机读写访问。它服务于 Google 内部多个核心产品：Google Search索引、Google Maps、Gmail、YouTube 等。
### 数据模型：稀疏的多维排序映射

与传统关系型数据库不同，BigTable 采用简单的**键值映射模型**：
```
(row_key, column_key, timestamp) → cell_value
```
![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260416081506653.png)

- **行（Row）**：由行键（Row Key）唯一标识，按字典序连续存储
- **列族（Column Family）& 列限定符**：列的分组集合（如 `personal:name`, `personal:email`），是权限和存储的基本单位
- **时间戳（Timestamp）**：支持多版本数据，可配置自动过期或保留最新 N 个版本
- **稀疏性**：空列不占存储空间，适合半结构化数据

### 架构特点

1. **基于 GFS 存储**：数据持久化在 Google File System（GFS）上，利用其冗余和可靠性
2. **LSM-Tree 结构**：写入先进入内存（MemTable），再批量刷写到磁盘（SSTable），适合写密集型负载
3. **自动分片（Tablet）**：数据按 Row Key 范围划分为 Tablet，自动分裂和迁移，实现水平扩展
4. **强一致性**：单行操作具有原子性，支持读写一致性
### 与 HBase 的关系

| 组件       | BigTable (Google) | HBase (Apache)  |
| -------- | ----------------- | --------------- |
| 文件系统     | GFS               | HDFS            |
| 协调服务     | Chubby            | ZooKeeper       |
| 内存结构     | MemTable          | MemStore        |
| 磁盘文件     | SSTable           | HFile           |
| 分片单位     | Tablet            | Region          |
| 海量数据并行处理 | MapReduce         | HadoopMapReduce |

HBase 本质上是 BigTable 论文的开源实现，两者共享相同的**面向列族、稀疏、多维映射**的设计哲学，是 NoSQL 数据库中**宽列存储（Wide-Column Store）** 类别的奠基者。

## `HBase`的数据模型

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260416082912706.png)

### 概念模型(逻辑上)
![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260416082850569.png)
### 数据坐标
```plain
(row_key, column_family, column identifier, timestamp) → cell_value
```

### 存储模型（物理上）

  • ==HBase 在 HDFS 上的物理布局==（Table -> Region -> Column Family -> HFile）
  • StoreFile/HFile 的格式详解
  • LSM Tree 架构：WAL + MemStore + Flush + Compaction
  • 读写路径的物理过程
  • Bloom Filter 和 Block Cache 的作用
  • ==为什么适合稀疏数据==（结合 KeyValue 存储模型）
  • ==行式存储 vs 列式存储的辨析==（HBase 是列族式存储）