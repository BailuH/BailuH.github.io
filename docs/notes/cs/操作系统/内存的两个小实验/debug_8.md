---
title: debug_8
createTime: 2026/05/01 20:27:07
permalink: /notes/cs/5miaz3ga/
---
# 动态数组的调试记录
好久不写数据结构，兴致勃勃地写了很长代码结果根本跑不动，不过也好，正好练习valgrind的使用了

### 1.段错误（segmentation fault）
这个小错误在动态数组的初始化，我当然知道不能引用没有初始化赋值的指针，但是本身我的动态数组这一数据结构也是一个指针，要先给最外层的数据结构分配内存，否则还是会发生**段错误**。
出错的代码如下：

```c
typedef struct vector{
    int* data;
    size_t size;
    size_t capacity;
} vector;
typedef vector* Ptr_vector;

//动态数组初始化
Ptr_vector vector_init(size_t capacity){
    Ptr_vector v;
    //分配初始内存:calloc函数可以顺带完成初始化的工作
    v->data = (int*)calloc(capacity,sizeof(int));
    v->size = 0;
    v->capacity = capacity;
    return v;
}
```
valgrind的报错如下：
```shell
✘ bailu@BAILU  ~/learning/os/ostep-homework/_vm-API   master  valgrind --leak-check=yes ./8
==12303== Memcheck, a memory error detector
==12303== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==12303== Using Valgrind-3.22.0 and LibVEX; rerun with -h for copyright info
==12303== Command: ./8
==12303== 
==12303== Use of uninitialised value of size 8
==12303==    at 0x109231: vector_init (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==    by 0x1097A1: main (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303== 
==12303== Invalid write of size 8
==12303==    at 0x109231: vector_init (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==    by 0x1097A1: main (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==  Address 0x0 is not stack'd, malloc'd or (recently) free'd
==12303== 
==12303== 
==12303== Process terminating with default action of signal 11 (SIGSEGV)
==12303==  Access not within mapped region at address 0x0
==12303==    at 0x109231: vector_init (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==    by 0x1097A1: main (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==  If you believe this happened as a result of a stack
==12303==  overflow in your program's main thread (unlikely but
==12303==  possible), you can try to increase the size of the
==12303==  main thread stack using the --main-stacksize= flag.
==12303==  The main thread stack size used in this run was 8388608.
==12303== 
==12303== HEAP SUMMARY:
==12303==     in use at exit: 1,064 bytes in 2 blocks
==12303==   total heap usage: 2 allocs, 0 frees, 1,064 bytes allocated
==12303== 
==12303== 40 bytes in 1 blocks are definitely lost in loss record 1 of 2
==12303==    at 0x484D953: calloc (in /usr/libexec/valgrind/vgpreload_memcheck-amd64-linux.so)
==12303==    by 0x109229: vector_init (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303==    by 0x1097A1: main (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==12303== 
==12303== LEAK SUMMARY:
==12303==    definitely lost: 40 bytes in 1 blocks
==12303==    indirectly lost: 0 bytes in 0 blocks
==12303==      possibly lost: 0 bytes in 0 blocks
==12303==    still reachable: 1,024 bytes in 1 blocks
==12303==         suppressed: 0 bytes in 0 blocks
==12303== Reachable blocks (those to which a pointer was found) are not shown.
==12303== To see them, rerun with: --leak-check=full --show-leak-kinds=all
==12303== 
==12303== Use --track-origins=yes to see where uninitialised values come from
==12303== For lists of detected and suppressed errors, rerun with: -s
==12303== ERROR SUMMARY: 3 errors from 3 contexts (suppressed: 0 from 0)
[1]    12303 segmentation fault (core dumped)  valgrind --leak-check=yes ./8
```
🥳修改后的代码是这样的：
```c
//动态数组初始化
Ptr_vector vector_init(size_t capacity){
    Ptr_vector v = (Ptr_vector)malloc(sizeof(vector));
    //关键修改点：补充了动态数组本身的内存分配
    v->data = (int*)calloc(capacity,sizeof(int));
    v->size = 0;
    v->capacity = capacity;
    return v;
}
```

### 2.内存泄漏（memory leak）
这个错误是我的想当然错误，我原本觉得这样的动态数组由于在内存中是连续分配空间的，因此只需要释放一个类似数组的“头指针”即可。其实这句话本身是没错的，只是我在主函数的位置只是简单释放了整个数据结构的“头指针”**（这是一个结构体指针）**，事实上这个**结构体指针**的data成员只是存储了一个**整数数组指针的值**，因此释放结构体指针的时候，由于整数数组指针的值被释放了，完美地造成了<u>整数数组指针指向的数组的内存空间无法找回，</u>造成了内存泄漏

调用的程序是这样的：
```c
int main(){
    printf("=====调试动态数组=====\n");
    Ptr_vector vector = vector_init(10);
    int i;
    for(i = 0; i<15; i++){
        add_v(vector, i);
    }
    printf("当前动态数组状态：\n");
    travel_v(vector);
    printf("删除第二个元素：%d\n",delete_v(vector, 2));
    printf("删除头一个元素：%d\n",delete_v(vector, 1));
    printf("删除最后一个元素：%d\n",delete_v(vector, vector->size)); 
    printf("删除第50个元素(越界）：%d\n",delete_v(vector, 50));
    printf("当前动态数组状态：\n");
    travel_v(vector);
    free(vector);
}
```
这个程序可以正常退出，只有打开valgrind才能发现内存泄漏的问题：
```shell
 bailu@BAILU  ~/learning/os/ostep-homework/_vm-API   master  valgrind --leak-check=yes ./8
==23854== Memcheck, a memory error detector
==23854== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==23854== Using Valgrind-3.22.0 and LibVEX; rerun with -h for copyright info
==23854== Command: ./8
==23854== 
=====调试动态数组=====
当前动态数组状态：
0-> 1-> 2-> 3-> 4-> 5-> 6-> 7-> 8-> 9-> 10-> 11-> 12-> 13-> 14-> 
删除第二个元素：1
删除头一个元素：0
删除最后一个元素：14
非法的索引，请检查！删除第50个元素(越界）：-1
当前动态数组状态：
2-> 3-> 4-> 5-> 6-> 7-> 8-> 9-> 10-> 11-> 12-> 13-> 
==23854== 
==23854== HEAP SUMMARY:
==23854==     in use at exit: 60 bytes in 1 blocks
==23854==   total heap usage: 8 allocs, 7 frees, 1,348 bytes allocated
==23854== 
==23854== 60 bytes in 1 blocks are definitely lost in loss record 1 of 1
==23854==    at 0x484DB80: realloc (in /usr/libexec/valgrind/vgpreload_memcheck-amd64-linux.so)
==23854==    by 0x1092DC: add_v (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==23854==    by 0x1097D0: main (in /home/bailu/learning/os/ostep-homework/_vm-API/8)
==23854== 
==23854== LEAK SUMMARY:
==23854==    definitely lost: 60 bytes in 1 blocks
==23854==    indirectly lost: 0 bytes in 0 blocks
==23854==      possibly lost: 0 bytes in 0 blocks
==23854==    still reachable: 0 bytes in 0 blocks
==23854==         suppressed: 0 bytes in 0 blocks
==23854== 
==23854== For lists of detected and suppressed errors, rerun with: -s
==23854== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
```
最好的办法是写一个函数专门用来释放内存，就像我们在链表那边那样做的一样，要注意从内向外的释放顺序：
```c
// 由于这个数组的内存空间是连续分配的，因此释放内存的时候直接释放指针就能全部释放了
void free_v(Ptr_vector v){
    free(v->data);
    free(v);
}
```