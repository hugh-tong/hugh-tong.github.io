---
title: GDB 操作笔记:以 OpenFOAM Laplacian 跟踪为例
date: 2026-09-15 16:00:00
categories:
  - [CS, 命令行工具]
tags:
  - CS/命令行工具
  - blockMesh
  - 命令行工具
  - LES
  - OpenFOAM
  - OF
description: GDB 常用操作笔记,以跟踪 OpenFOAM laplacianFoam 求解过程为例。
mathjax: true
---

# GDB 相关操作笔记（OpenFOAM-Laplacian 跟踪示例）

## 常用命令总结

```text

info locals //显示所有局部变量，OpenFOAM里别用，会爆炸
info variables/classes/functions/selectors            //顾名思义，但都别乱用，容易爆炸
info break  //显示所有breakpoints
info source //显示当前位置的文件调用关系，非常有用，尤其是被调用的文件是link的时候
n           //next，单个文件里的下一行
s           //step，下一步，能够跳转进入function内部
finish      //从当前function跳出
return      //取消当前函数的执行，并立即返回，后面可以跟一个数值，作为函数的返回值
c           //continue直到下一个breakpoint
r           //run，开始运行code
b           //设置breakpoint，基本格式：break 49;设定指定文件：b gaussLaplacianScheme.C:52
delete 1    //删除代号为1的断点
clear       //删除所有断点
pfvmatrixfull this matrix.txt    //专门用于输出矩阵，一般要先
ctrl+c      //卡住的时候用来跳出
set logging on/off          //用来将gdb命令显示的结果输出到默认的gdb.txt文件里
where       //告诉你你现在在哪个文件里
l           //list，显示附近的代码。可显示特点行号前后10行代码，如：list 12
watch       //表示设置一个监视点，当所指定的表达式EXPR的值被修改了，则程序会停止。
rwatch      //表示设置一个监视点，当所指定的表达式EXPR的值被读取了，则程序会停止。
awatch      //表示设置一个监视点，当所指定的表达式EXPR的值被读取或修改了，都会让程序停止。
p var       //显示变量var
p var@n     //显示数组变量var的前n个元素
whatis var  //显示变量var的类型

```


GdbOF专属命令：

![gdbOf常用命令](https://picx.zhimg.com/v2-9c50f356526b4d9e90215708369cd3e5_r.jpg)

## 1. 启动与附加调试

- 启动可执行文件并进入 GDB
    
    - gdb /path/to/blockMesh
- 直接在程序启动时就运行
    
    - (gdb) run [args]
- 对正在运行的进程进行附加调试
    
    - (gdb) attach

## 2. 设置断点

- 在函数层设置断点（需要源码或符号信息）
    - (gdb) break laplacian
- 在具体文件和行号设置断点
    - (gdb) break path/to/file.C:1234
- 在 main 函数入口设断点
    - (gdb) break main
- 条件断点（只有满足条件时才触发）
    - (gdb) break path/to/file.C:1234 if (i == 0)

## 3. 运行与定位

- 运行到断点
    - (gdb) run
- 查看当前断点处的调用栈
    - (gdb) bt
    - (gdb) bt full # 显示更详细的局部变量
- 在不同栈帧之间切换
    - (gdb) frame 0
    - (gdb) frame 2

## 4. 查看变量与内存

- 查看当前帧的局部变量
    - (gdb) info locals
    - (gdb) info args
- 打印变量的值
    - (gdb) print varName
    - (gdb) p varName
- 查看指针指向的内容
    - (gdb) print *ptr
    - (gdb) print ptr->field
- 查看数组/向量
    - (gdb) print arr[0]
    - (gdb) print arr[i]
- 查看结构体/自定义对象
    - (gdb) p myStruct
    - (gdb) p myStruct.field

## 5. 单步执行

- 跳过函数内部，逐步执行当前语句
    - (gdb) next
- 进入函数内部逐步执行
    - (gdb) step
- 继续执行至下一个断点或结束
    - (gdb) continue
- 在任意行设置新的断点后继续执行
    - (gdb) break file.C:line
    - (gdb) continue

## 6. 观察变量变化

- 观察变量值的变化（触发时暂停）
    - (gdb) watch varName
- 取消观察
    - (gdb) delete watch varName
- 条件断点（变量达到某值时断点触发）
    - (gdb) break file.C:line if (varName > 0)

## 7. 断点管理

- 查看当前所有断点
    - (gdb) info breakpoints
- 删除断点
    - (gdb) delete
    - (gdb) delete 1 2 3 # 删除指定序号的断点
- 重新启用/禁用断点
    - (gdb) enable
    - (gdb) disable

## 8. 内存与调试辅助

- 打印复合类型的字段并逐步调试
    - (gdb) p obj.field
- 调用外部函数输出
    - (gdb) call printf("x = %d\n", x)

## 9. 与 OpenFOAM 相关的调试实践要点

- 启用调试信息
    - 确保编译时带 -g，OpenFOAM 常用的调试构建可用。
- 尽量在关键点设置断点
    - laplacian 的入口、派生类创建点、fvSchemes 的选择点等位置。
- 并行调试提示
    - MPI 场景下，可能需要为不同进程分别 attach 或在 mpirun/mpiexec 层面开启调试参数。
- 日志与复现
    - 同时查看 OpenFOAM 日志输出，确保断点处的变量与日志信息一致，便于复现与定位。

## 10. 简单工作流示例（假设调试 laplacian 的路径）

- 步骤 1: 启动 GDB
    - gdb /path/to/blockMesh
- 步骤 2: 设置断点（假设定位到 laplacian 的实现文件）
    - (gdb) break path/to/laplacianFoam.C:120
    - (gdb) break gaussLaplacianScheme.cpp:45
- 步骤 3: 运行
    - (gdb) run
- 步骤 4: 到达断点后查看
    - (gdb) bt
    - (gdb) info locals
    - (gdb) print Gamma
    - (gdb) print vf
- 步骤 5: 单步调查
    - (gdb) step
    - (gdb) next
- 步骤 6: 动态观察
    - (gdb) watch Gamma
    - (gdb) continue

