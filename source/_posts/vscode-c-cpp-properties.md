---
title: c_cpp_properties的设置
date: 2023-08-27 23:31:45
tags: vscode
---







[ubuntu 下 GCC/G++ 的 include 搜索路径查看与设置_ubuntu g++ clude_许野平的博客-CSDN博客](https://blog.csdn.net/quicmous/article/details/106790319)

> echo 'main(){}'|gcc -E -v -



```
#include <...> search starts here:
 /usr/lib/gcc/x86_64-linux-gnu/7/include
 /usr/local/include
 /usr/lib/gcc/x86_64-linux-gnu/7/include-fixed
 /usr/include/x86_64-linux-gnu
 /usr/include
```





