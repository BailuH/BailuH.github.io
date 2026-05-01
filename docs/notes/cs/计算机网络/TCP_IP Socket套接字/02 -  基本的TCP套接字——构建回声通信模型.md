### 文件结构：
```txt
.
├── DIeWithMessage.c
├── TCPEchoClient4.c
└── practical.h
```

### 需要熟悉的标准C宏

| 标准C宏             | 用途          | 常用函数举例                                   | 常见标识符举例                          |
| ---------------- | ----------- | ---------------------------------------- | -------------------------------- |
| `<stdio.h>`      | 标准输入输出      | `printf()`,`fputc()`,`fputs()`,`scanf()` | `BUFSIZ`                         |
| `<stdlib.h>`     | 标准库         | `exit()`,`atoi()`,                       |                                  |
| `<string.h>`     | 字符串处理       | `strlen()`,`strcmp()`,`memset()`         |                                  |
| `<unistd.h>`     | Unix标准函数    | `close()`                                |                                  |
| `<sys/types.h>`  | 系统数据类型      |                                          | `ssize_t`,`size_t`,`socklen_t`   |
| `<sys/socket.h>` | C套接字编程核心头文件 | `socket()`,`connect()`,`send()`,`recv()` |                                  |
| `<netinet/in.h>` | 互联网地址族      |                                          | `struct sockaddr_in`,`in_port_t` |
| `<arpa/inet.h>`  | 地址转换函数      | `inet_pton()`,`inet_ntop()`              |                                  |



## 客户端

`TCPEchoClient.c`
客户端的职责是**发起与被动等待**联系的服务器之间的通信。
典型的TCP客户端的通信涉及以下4个基本步骤：
1. 使用`socket()`创建TCP套接字。
2. 使用`connect()`建立到达服务器的连接。
3. 使用`send`和`recv()` 进行通信。
4. 使用`close()`关闭连接。

 ```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <sys/types.h>
#include <sys/socket.h>

#include <netinet/in.h>
#include <arpa/inet.h>

#include "practical.h"

    /*
    回声Client示例。
    argv -> [server IP, echo string, server port<Optional>]
    */

int main(int argc, char *argv[]){
    // 检验传入main函数的参数数量
    if (argc <3 || argc > 4)
        DieWithUserMessage("Parameter(s)", "<Server Address> <Echo Word> [<Sever Port>]");

    // 提取Client的输入参数
    char *servIP = argv[1];
    char *echoString = argv[2];

    // in_port_t 是<netinet/in.h>里定义的，                                        
    // 如果没有提供端口号参数，则默认设置为7
    in_port_t servPort = (argc == 4)? atoi(argv[3]):7;

    int sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if(sock < 0)
        DieWithSystemMessage("socket() failed");
    // 准备sockaddr_in结构用于存放服务器地址
    struct sockaddr_in servAddr;
    // 调用memset()保证未显示设置的结构的任何部分都包含0,防止分配的内存上的脏数据被后续意外读取导致崩溃
    memset(&servAddr, 0, sizeof(servAddr));
    
    // 填写sockaddr_in结构，包括地址族(AF_INET)、IP地址与端口
    servAddr.sin_family = AF_INET;
    // 转换地址
    int rtnVal = inet_pton(AF_INET, servIP, &servAddr.sin_addr.s_addr);
    if (rtnVal == 0)
        DieWithUserMessage("inet_pton() failed", "invalid address string");
    else if (rtnVal < 0)
        DieWithSystemMessage("inet_pton() failed");
    servAddr.sin_port = htons(servPort);

    // 声明与服务器的连接
    if (connect(sock, (struct sockaddr *) &servAddr, sizeof(servAddr)) < 0)
        DieWithSystemMessage("connect() failed");

    //先计算字符串长度
    size_t echoStringLen = strlen(echoString);  
    // 把回声字符串发送给服务器
    ssize_t numBytes = send(sock, echoString, echoStringLen, 0);
    if (numBytes < 0) {
        DieWithSystemMessage("send() failed");
    }
    else if (numBytes != echoStringLen) {
        DieWithUserMessage("send() failed", "sent unexpected number of bytes");
    }

    // 接收服务器返回的回声字符串
    unsigned int totalBytesRcvd = 0;
    fputs("Received: ", stdout);
    while (totalBytesRcvd < echoStringLen) {
        char buffer[BUFSIZ];    // BUFSIZE ❌
        numBytes = recv(sock, buffer, BUFSIZ - 1, 0);
        if (numBytes < 0) {
            DieWithSystemMessage("recv() failed");
        }
        else if (numBytes == 0) {
            DieWithUserMessage("recv() failed", "connection closed prematurely");
        }
        totalBytesRcvd += numBytes;
        buffer[numBytes] = '\0';
        fputs(buffer, stdout);
    }

    fputc('\n', stdout);

    close(sock);
    exit(0);
}
 ```

`DieWithMessage.c`

