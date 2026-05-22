## 9.1 概述

### 9.1.1 Hive简介
- **定位**：构建于 Hadoop 顶层的数据仓库工具，本质上是**用户编程接口**，本身不存储和处理数据
- **依赖**：HDFS 存储数据，MapReduce 处理数据
- **核心价值**：让熟悉 SQL 的用户通过 **HiveQL** 以类传统数据库的方式管理和查询分布式海量数据
- **适用场景**：数据仓库应用（海量数据维护、挖掘、报表、历史分析），采用**批处理**方式处理**静态数据**

### 9.1.2 Hive与Hadoop生态系统的关系
| 组件        | 角色         | 与Hive的关系                        |
| --------- | ---------- | ------------------------------- |
| HDFS      | 高可靠性底层存储   | Hive依赖其存储海量数据                   |
| MapReduce | 分布式并行计算    | HiveQL最终转化为MapReduce任务执行        |
| Pig       | 数据流语言和运行环境 | 适合ETL和半结构化数据查询，可作为Hive替代工具      |
| HBase     | 面向列的分布式数据库 | 提供**实时访问**，与Hive（静态数据/BI报表）功能互补 |

![image.png](https://bailu-1382509292.cos.ap-beijing.myqcloud.com/obsidian/20260521080900940.png)

### 9.1.3 Hive与传统数据库对比

| 对比项 | Hive | 传统数据库 |
|--------|------|-----------|
| 数据插入 | 仅支持批量导入 | 支持单条和批量导入 |
| 数据更新 | **不支持** | 支持 |
| 索引 | 有限支持（0.7+版本），无键概念，索引数据存于另表 | 完善支持 |
| 分区 | 支持（按分区列粗略划分，加速查询） | 支持 |
| 执行延迟 | **高**（分钟级） | 低（秒级） |
| 扩展性 | **好**（基于集群横向扩展） | 有限（纵向扩展为主） |

**核心区别**：Hive为大规模批量分析（OLAP）而生，存储历史静态数据；传统数据库侧重事务处理和实时响应。

### 9.1.4 企业部署案例（Facebook架构）
1. Web服务器/内部服务产生日志数据
2. Scribe服务器聚合日志到 Filers（网络文件服务器）
3. 日志和维度数据（从MySQL）复制到 **HDFS**
4. **Hive** 在HDFS上构建数据仓库，生成概要信息、报表和历史分析
5. 需要**实时联机访问**的数据存放在 **Oracle RAC**（实时应用集群）

> **维度数据**：描述业务事件的"背景信息"（谁、何时、何地、通过什么方式发生）；与之相对的是**事实数据**（事件本身，如页面点击、购买）。

---

## 9.2 Hive系统架构

### 9.2.1 概述与组成模块

三大核心模块：

1. **用户接口模块**
   - **CLI**：命令行界面
   - **HWI**：简单网页界面
   - **JDBC/ODBC/Thrift Server**：编程访问接口

2. **驱动模块**
   - 编译器、优化器、执行器
   - 负责解析编译输入、优化计算、按步骤执行（通常启动MapReduce任务）

3. **元数据存储模块（Metastore）**
   - 独立的关系型数据库（通常连接 **MySQL** 实例，或Hive自带的 **Derby**）
   - 保存：表名称、列及其属性、分区及其属性、表属性、数据所在位置信息等

### 9.2.3 Hive工作原理

#### SQL语句转换成MapReduce的基本原理

**Join实现原理**
- **Map阶段**：各表记录映射为键值对 `(uid, <标记位, 字段>)`，如 `(1, <1, Lily>)`、`(1, <2, 101>)`
- **Shuffle/Sort阶段**：按 `uid` 哈希到同一Reduce机器，并按标记位排序
- **Reduce阶段**：对相同 `uid` 的不同表数据做**笛卡尔积**连接，生成最终结果

**Group By实现原理**
- **Map阶段**：`(rank, level)` 映射为 `(<rank,level>, count)`
- **Shuffle/Sort阶段**：按 `<rank,level>` 哈希到Reduce机器并排序
- **Reduce阶段**：相同键的 `count` 值**累加**，生成最终结果 `(A,1,3)`

#### Hive中SQL查询转换成MapReduce作业的完整过程

| 步骤 | 动作 | 说明 |
|------|------|------|
| 0 | 用户输入HiveQL | 通过CLI或其他工具 |
| 1 | 词法语法解析 | Antlr工具将SQL转化为**抽象语法树（AST Tree）** |
| 2 | AST → QueryBlock | 将语法树转化为查询单元（输入源、计算过程、输出） |
| 3 | QueryBlock → OperatorTree | 生成由逻辑操作符组成的执行树：TableScanOperator、SelectOperator、FilterOperator、JoinOperator、GroupByOperator、ReduceSinkOperator等 |
| 4 | 逻辑优化 | 合并多余操作符，减少MR任务数量和Shuffle数据量 |
| 5 | OperatorTree → MR任务 | 根据逻辑操作符生成MapReduce任务 |
| 6 | 物理优化 | 对MR任务优化，生成最终执行计划 |
| 7 | 执行 | 执行器启动MapReduce任务 |

> **特例**：`select * from 表`（全表扫描，无投影和选择）**不需要**执行MapReduce操作。

---

## 9.3 Hive的应用

### Hadoop数据仓库框架中的角色
- **Hive**：报表中心 → **报表分析**
- **Pig**：报表中心 → **报表数据转换（ETL）**
- **HBase**：在线业务 → **实时数据访问**（弥补HDFS缺乏随机读写）
- **Mahout**：BI（商务智能）→ 提供可扩展的机器学习经典算法

### Hive HA（高可用性）基本原理
- **核心思想**：冗余部署 + 自动故障转移
- **实现**：HiveServer2 和 Hive Metastore 多实例同时运行
- **HAProxy**：对外提供统一接口，轮询资源池中可用的Hive实例，将若干Hive实例纳入一个资源池，视为一台"超强Hive"

---

## 9.4 Impala

### 9.4.1 Impala简介
- **开发方**：Cloudera
- **定位**：新型查询系统，提供SQL语义，查询HDFS和HBase上的PB级大数据
- **设计参照**：Google Dremel系统
- **目的**：**非替换**MapReduce，而是提供统一的**实时查询**平台

### 9.4.2 Impala系统架构

三大组件：

1. **Impalad**
   - 协调客户端查询执行
   - 给其他impalad分配任务并收集结果汇总
   - 执行本地HDFS/HBase数据操作
   - 内含：Query Planner、Query Coordinator、Query Exec Engine
   - 与HDFS DN同节点运行，完全分布运行在**MPP（大规模并行处理）**架构

2. **State Store（statestored进程）**
   - 跟踪集群中Impalad的健康状态和位置信息
   - 处理注册订阅和心跳连接
   - 离线后Impalad进入recovery模式反复注册；重新加入后自动恢复

3. **CLI**
   - 命令行工具，提供Hue、JDBC、ODBC接口

**Impala查询执行过程**：
1. Impalad向State Store注册订阅
2. CLI提交查询 → Query Planner解析SQL为解析树 → 生成若干 **PlanFragment**（由PlanNode组成，可原子执行于单独节点）→ Query Coordinator
3. Coordinator从HDFS名称节点获取数据地址，从MySQL元数据库获取元数据，定位所有相关数据节点
4. Coordinator初始化并分配查询任务到各数据节点
5. Query Executor流式交换中间输出，Coordinator汇聚结果
6. Coordinator返回汇总结果给CLI

### 9.4.3 Impala与Hive的比较

**不同点**：
| 特性 | Hive | Impala |
|------|------|--------|
| 适用场景 | 长时间批处理查询分析 | 实时交互式SQL查询 |
| 执行框架 | 依赖MapReduce，管道型MR任务模式 | 完整执行计划树，MPP架构 |
| 内存处理 | 内存不足时利用外存，保证查询完成 | 内存不足不利用外存，查询受限 |
| 延迟 | 高（分钟级） | 低（秒级甚至毫秒级） |

**相同点**：
- 使用相同的存储数据池（HDFS、HBase；支持TEXT、RCFILE、PARQUET、AVRO等格式）
- 使用相同的元数据（共享Hive Metastore）
- SQL解释处理相似（均通过词法分析生成执行计划）

---

## 9.5 Hive编程实践

### 9.5.1 安装与配置
- 安装包：`apache-hive-1.2.1-bin.tar.gz`
- 解压路径：`/usr/local`
- 配置：`hive-site.xml`（参考`hive-default.xml.template`）
- 运行模式：单机模式、伪分布式模式、分布式模式
- 前置条件：JDK 1.6+，已启动Hadoop

### 9.5.2 数据类型

**基本数据类型**：
`TINYINT`(1字节), `SMALLINT`(2字节), `INT`(4字节), `BIGINT`(8字节), `FLOAT`(4字节), `DOUBLE`(8字节), `BOOLEAN`, `STRING`, `TIMESTAMP`, `BINARY`

**集合数据类型**：
- `ARRAY`：有序字段，类型必须相同，如 `Array(1,2)`
- `MAP`：无序键值对，键必须是原子类型，如 `Map('a',1,'b',2)`
- `STRUCT`：命名字段，类型可以不同，如 `Struct('a',1,1,0)`

### 9.5.3 基本操作

**1. create**
```sql
-- 数据库
create database hive;
create database if not exists hive;

-- 基本表
use hive;
create table if not exists usr(id bigint, name string, age int);
create table if not exists hive.usr(id bigint, name string, age int)
  location '/usr/local/hive/warehouse/hive/usr';

-- 外部表（读取指定路径下以逗号分隔的数据）
create external table if not exists hive.usr(id bigint, name string, age int)
  row format delimited fields terminated by ','
  location '/usr/local/data';

-- 分区表
create table hive.usr(id bigint, name string, age int) partition by(sex boolean);

-- 复制表结构
create table if not exists usr1 like usr;

-- 视图
create view little_usr as select id, age from usr;
```

**2. drop**
```sql
drop database hive;
drop database if not exists hive;
drop database if not exists hive cascade;  -- 级联删除库及其中表

-- 内部表：删元数据+实际数据；外部表：只删元数据
drop table if exists usr;
drop view if exists little_usr;
```

**3. alter**
```sql
-- 数据库属性
alter database hive set dbproperties('edited-by'='lily');

-- 表
alter table usr rename to user;
alter table usr add if not exists partition(age=10);
alter table usr drop if exists partition(age=10);
alter table usr change name username string after age;
alter table usr add columns(sex boolean);
alter table usr replace columns(newid bigint, newname string, newage int);
alter table usr set tabproperties('notes'='the columns in usr may be null except id');

-- 视图
alter view little_usr set tabproperties('create_at'='refer to timestamp');
```

**4. show**
```sql
show databases;
show databases like 'h.*';
use hive;
show tables;
show tables in hive like 'u.*';
```

**5. describe**
```sql
describe hive.usr;           -- 基本信息（列信息等）
describe extended hive.usr;  -- 详细信息（位置、属性等）
describe extended hive.usr.id; -- 某列信息
describe database hive;
describe database extended hive;
```

**6. load**
```sql
-- 本地文件（覆盖/追加）
load data local inpath '/usr/local/data' overwrite into table usr;
load data local inpath '/usr/local/data' into table usr;

-- HDFS文件（覆盖）
load data inpath 'hdfs://master_server/usr/local/data' overwrite into table usr;
```

**7. insert**
```sql
-- 覆盖/追加插入
insert overwrite table usr1 select * from usr where age=10;
insert into table usr1 select * from usr where age=10;
```

### 9.5.4 WordCount实例

准备数据：
```bash
cd /usr/local/hadoop
mkdir input
cd input
echo "hello world" > file1.txt
echo "hello hadoop" > file2.txt
```

HiveQL实现：
```sql
create table docs(line string);
load data inpath 'input' overwrite into table docs;

create table word_count as
select word, count(1) as count
from (select explode(split(line,' ')) as word from docs) w
group by word
order by word;
```

### 9.5.5 Hive与MapReduce执行WordCount对比
- **代码量**：MapReduce（Java，约63行） vs Hive（7行HiveQL）
- **执行方式**：MR需手动编译生成jar文件；Hive由框架**自动**将HiveQL转为MapReduce，用户无需关注底层实现细节

---

## 本章核心脉络

Hive的本质是"**SQL接口层**"：它不存储数据，也不直接计算，而是把用户熟悉的HiveQL语句**翻译**成Hadoop生态能理解的MapReduce任务，让海量数据的批处理分析变得像操作传统数据库一样简单。与之互补的Impala则填补了**实时交互查询**的空白，两者共享元数据和存储池，共同构成Hadoop数据仓库的查询层。