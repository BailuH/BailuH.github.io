# 《大数据技术基础》第9章 Spark 学习复习笔记

## 10.1 Spark概述
### 10.1.1 Spark简介
* **起源与定义**：Spark于2009年由加州伯克利大学AMP实验室开发，是基于内存计算的大数据并行计算框架，用于构建大型、低延迟的数据分析应用程序。
* **历史突破**：2014年打破了Hadoop保持的基准排序纪录（Spark用206个节点/23分钟处理100TB数据；Hadoop用2000个节点/72分钟处理100TB数据），即用1/10的计算资源获得了3倍的速度提升。
* **核心特点**：
  * **运行速度快**：使用DAG（有向无环图）执行引擎，支持循环数据流与内存计算。
  * **容易使用**：支持Scala、Java、Python和R语言编程，可通过Spark Shell进行交互式编程。
  * **通用性强**：提供完整而强大的技术栈，包括SQL查询、流式计算、机器学习和图算法组件。
  * **运行模式多样**：可运行于独立集群、Hadoop、Amazon EC2等环境，支持访问HDFS、Cassandra、HBase、Hive等多种数据源。

### 10.1.2 Scala简介
* **定义**：现代多范式编程语言，运行于Java平台（JVM），兼容现有Java程序，是纯面向对象的语言。
* **特性**：具备强大的并发性，支持函数式编程（函数本身可作为参数传递，也可作为返回值输出），更好地支持分布式系统。
* **优势**：语法简洁，提供优雅的API，运行速度快。提供了REPL（交互式解释器），支持即时编译和运行，提高开发效率。Scala是Spark的主要编程语言。

### 10.1.3 Spark与Hadoop的对比
* **Hadoop MapReduce的缺点**：
  1. 表达能力有限（计算必须转换成Map和Reduce两个操作）。
  2. 磁盘IO开销大（每次执行都要从磁盘读取数据，并将中间结果存入磁盘）。
  3. 延迟高（多阶段任务按照顺序串行衔接，前一个任务完成前其他任务无法开始，不适合复杂的迭代计算）。
* **Spark的优点**：
  1. 计算模式不局限于Map和Reduce，编程模型更灵活。
  2. 提供了**内存计算**，可将中间结果放到内存中，迭代运算效率极高。
  3. 基于DAG的任务调度执行机制，比MapReduce的迭代机制更优，更适合数据挖掘与机器学习。

---

## 10.2 Spark生态系统
* **大数据处理三大类型与传统框架**：
  1. 复杂的批量数据处理：小时级（MapReduce、Hive）。
  2. 基于历史数据的交互式查询：分钟、秒级（Impala、Dremel、Drill）。
  3. 基于实时数据流的数据处理：毫秒、秒级（Storm、S4）。
* **传统混搭架构的问题**：输入输出数据无法做到无缝共享（需做格式转换）；不同软件需要不同的开发维护团队，使用成本高；难以对同一个集群进行统一的资源协调分配。
* **Spark的设计理念**：“一个软件栈满足不同应用场景”，形成一套完整的生态系统——BDAS（伯克利数据分析软件栈）。
* **核心组件及其应用场景**：

| 组件名称 | 对应功能与应用场景 | 传统对应框架/组件 |
| :--- | :--- | :--- |
| **Spark Core** | 包含内存计算、任务调度、部署模式、故障恢复等基本功能，面向**批量数据处理**。 | MapReduce、Hive |
| **Spark SQL** | 允许统一处理关系表和RDD，直接处理分布式内存抽象，或查询Hive、HBase等外部数据。 | Impala、Dremel、Drill |
| **Spark Streaming** | 将流数据分解成一系列短小的批处理作业交付Core处理，支持高吞吐、容错的**实时流处理**。 | Storm、S4 |
| **Structured Streaming** | 基于Spark SQL引擎构建的、可扩展且容错的流处理引擎。 | - |
| **MLlib** | 提供常用**机器学习**算法实现（聚类、分类、回归、协同过滤等），降低机器学习门槛。 | Mahout |
| **GraphX** | 专用于**图计算**的API，是分布式图计算模型Pregel在Spark上的重写及优化。 | Pregel、Hama |

*注：各组件方法通用、数据共享，不同应用之间的数据可以无缝集成。*

---

## 10.3 Spark运行架构
### 10.3.1 基本概念
* **RDD（弹性分布式数据集）**：Resilient Distributed Dataset，是分布式内存的一个抽象概念，提供了一种高度受限的共享内存模型。
* **DAG（有向无环图）**：Directed Acyclic Graph，反映RDD之间的依赖关系。
* **Executor**：工作节点（Worker Node）上的一个进程，负责运行任务并为应用程序存储数据。
* **应用（Application）**：用户编写的Spark应用程序。
* **任务（Task）**：运行在Executor上的基本工作单元。
* **作业（Job）**：一个Job包含多个RDD及作用于相应RDD上的各种操作（由Action触发）。
* **阶段（Stage）**：作业的基本调度单位，一个Job会根据依赖关系分为多组任务（称为Stage或任务集）。

### 10.3.2 架构设计与流程
* **组成部分**：集群资源管理器（Cluster Manager）、工作节点（Worker Node）、任务控制节点（Driver）和执行进程（Executor）。
* **Executor的优点**：
  1. 利用多线程来执行具体任务，减少任务的启动开销。
  2. 内置BlockManager存储模块，内存与磁盘共同作为存储设备，有效减少IO开销。
* **层级关系**：一个应用 $\rightarrow$ 一个Driver + 若干个作业(Job) $\rightarrow$ 一个作业 $\rightarrow$ 多个阶段(Stage) $\rightarrow$ 一个阶段 $\rightarrow$ 多个任务(Task)。
* **运行基本流程**：
  1. Driver创建`SparkContext`，构建基本的运行环境，进行资源申请、任务分配和监控。
  2. 资源管理器为Executor分配资源并启动Executor进程。
  3. `SparkContext`根据RDD依赖关系构建DAG图，提交给`DAGScheduler`解析成Stage，然后把任务集提交给底层的`TaskScheduler`；Executor向`SparkContext`申请Task，任务调度器分发任务给Executor运行。
  4. 任务在Executor上多线程运行，把执行结果反馈给任务调度器和DAG调度器，运行完毕后写入数据并释放资源。
* **优化机制**：采用**数据本地性**（“计算向数据靠拢”，利用延迟调度实现优化）和**推测执行**机制。

### 10.3.3 RDD运行原理
* **核心概念**：RDD是分布在集群多台机器上、只读的、可并行处理的记录分区集合。
* **操作类型**：
  * **转换（Transformation）**：如`map`、`filter`、`flatMap`、`groupByKey`、`reduceByKey`等粗粒度数据转换操作。特点是**惰性调用**（Lazy Evaluation），只记录转换规则，不立即触发计算。
  * **行动（Action）**：如`count`、`collect`、`first`、`take`、`reduce`、`foreach`等。会触发实际的物理计算，并将结果返回给Driver或写入外部存储。
* **实现高效计算的原因**：
  1. **高效的容错性**：利用父子依赖（血缘关系 Lineage），只需重新计算丢失的分区，无需回滚系统，重算过程可并行，避免了大量数据复制和记录日志的开销。
  2. **中间结果持久化到内存**：数据在内存中的多个RDD操作之间传递，减少磁盘I/O。
  3. **存放数据可以是Java对象**：避免了不必要的对象序列化和反序列化开销。
* **依赖关系分类（根据是否包含Shuffle操作区分）**：
  * **Shuffle操作**：在宽依赖发生时，将数据跨分区重新分布的过程（包含Map端写本地磁盘、Reduce端网络拉取传输及聚合合并三个阶段，开销高昂）。
  * **窄依赖（Narrow Dependency）**：每个父RDD的分区最多被一个子RDD的分区使用（如`map`、`filter`、`flatMap`、`union`等）。无需跨节点移动数据，**可以实现流水线（Pipeline）优化**。
  * **宽依赖（Wide Dependency）**：存在一个父RDD的分区对应一个子RDD的多个分区（如`groupByKey`、`reduceByKey`、`repartition`、无法协同划分的`join`等）。必然触发Shuffle，无法实现流水线优化。
* **Stage的划分方法**：在DAG图中进行反向解析，**遇到宽依赖就断开**划分新Stage，遇到窄依赖就把当前RDD加入到同一个Stage中，使窄依赖尽量在同一个Stage中进行流水线计算。

---

## 10.4 Spark的部署和应用方式
* **部署方式**：支持 Local（单机）、Standalone、Spark on Mesos、Spark on YARN、Spark on Kubernetes 五种。
* **转向Spark架构的优点**：实现一键式安装和配置、线程级任务监控告警，降低维护与开发难度，便于做成统一的计算平台资源池。
* *注意：Spark Streaming无法实现毫秒级的实时响应，毫秒级响应的企业应用仍需采用Storm/Flink等流计算框架。*
* **YARN统一部署好处**：计算资源按需伸缩、集群利用率高、共享底层存储以避免跨集群迁移数据。

---

## 10.5 & 10.6 Spark编程实践
### 10.5.1 安装与启动
* **前提**：必须先安装Java环境和Hadoop环境。
* **配置Classpath**：在`conf/spark-env.sh`中添加：
  `export SPARK_DIST_CLASSPATH=$(/usr/local/hadoop/bin/hadoop classpath)`
* **启动Spark Shell**（Scala环境）：`./bin/spark-shell`

### 10.5.2 RDD基本操作常用API（Scala示例）
* **创建RDD（读取本地文件）**：
  ```scala
  val textFile = sc.textFile("file:///usr/local/spark/README.md")
  ```

- **链式转换与行动操作**（筛选含"Spark"的行并统计行数）：
    
```scala
val linesCountWithSpark = textFile.filter(line => line.contains("Spark")).count()
```
    
- **经典的词频统计（WordCount）实现**：
    ```scala
    val wordCounts = textFile.flatMap(line => line.split(" "))
                             .map(word => (word, 1))
                             .reduceByKey((a, b) => a + b)
    wordCounts.collect() // 输出结果
    ```
    
### 10.6.4 独立应用程序打包与提交

1. **创建结构**：`mkdir -p ~/sparkapp/src/main/scala`
2. **编写代码文件**（`SimpleApp.scala`）以及定义依赖与版本的配置文件（`simple.sbt`）。
3. **使用sbt进行打包**：
    
```bash
cd ~/sparkapp
/usr/local/sbt/sbt package
```

4. **通过spark-submit提交运行**：

```bash
/usr/local/spark/bin/spark-submit --class "SimpleApp" ~/sparkapp/target/scala-2.11/simple-project_2.11-1.0.jar
```
