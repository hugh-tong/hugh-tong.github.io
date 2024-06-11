---
title: nm_ldd_init_tttt_test
date: 2023-10-08 21:24:48
tags:
  - Tools
  - code技巧
---


#### nm命令

`nm` 命令是一个用于查看**二进制文件、库文件、可执行文件**中符号信息的命令行工具。它通常用于分析程序的二进制文件，以获取关于程序结构的信息。

> Ref: [linux下强大的文件分析工具 -- nm - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/363014233#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%94%A8%E5%88%B0nm)

以OpenFOAM中的一个`.o`文件为例，`OpenFOAM/OpenFOAM-7/platforms/linux64GccDPInt32Opt/applications/solvers/DNS/dnsFoam/dnsFoam.o`
用`nm`命令可以查看其中的符号，`nm  -C dnsFoam.o`。

```
0000000000000000 V vtable for Foam::DimensionedField<double, Foam::volMesh>
0000000000000000 V vtable for Foam::fvMatrix<Foam::Vector<double> >
0000000000000000 V vtable for Foam::fvMatrix<double>
0000000000000000 V vtable for Foam::LduMatrix<Foam::Vector<double>, double, double>::solver
0000000000000000 V vtable for Foam::LduMatrix<double, double, double>::solver
0000000000000000 V vtable for Foam::Residuals<Foam::Vector<double> >
0000000000000000 V vtable for Foam::Residuals<double>
0000000000000010 W non-virtual thunk to Foam::fvMesh::thisDb() const
                 U operator delete[](void*)
                 U operator delete(void*)
                 U operator new[](unsigned long)
                 U operator new(unsigned long)

```


以下是 `nm` 命令的一些常用输出格式：

1. **`U`：未定义符号**，表示该符号在当前目标文件中被引用，但并未在当前目标文件中定义，需要在链接时从其他地方解析。
2. **`T`：文本段（代码段）符号**，表示对应的符号在代码段中，通常是可执行程序的一部分。
3. **`D`：数据段符号**，表示对应的符号在数据段中，通常是全局变量。
4. **`B`：BSS段符号**，表示对应的符号在BSS段中，通常是未初始化的全局变量。
5. **`W`：弱符号**，表示对应的符号是一个可以被重定位或被其他模块覆盖的符号。
6. **`S`：特殊符号**，通常用于标记一些特殊的符号，比如函数的开始和结束。
7. **地址**：符号的内存地址，可以是十六进制数。
8. **符号名**：函数名、变量名等。


TODO: 结合C++的type_trait，typeid等函数来解释符号表。引入函数签名等。


一个示例演示：
```C++
#include <iostream>
#include <typeinfo>

int main() {

    int x = 10;
    double y = 20.5;

    // 使用typeid获取变量的类型信息
    const std::type_info& typeInfoX = typeid(x);
    const std::type_info& typeInfoY = typeid(y);

    // 输出类型信息的名称
    std::cout << "Type of x: " << typeInfoX.name() << std::endl;
    std::cout << "Type of y: " << typeInfoY.name() << std::endl;

    return 0;

}
```

> 这种获取类型信息的方式允许程序在运行时获取对象的实际类型，也就是RTTI(Run-Time Type Information)

编译后，运行结果：
```shell
Type of x: i
Type of y: d
```

`nm -C a.out`查看其符号表可以发现，

```
0000000000003d80 V typeinfo for double@CXXABI_1.3
0000000000003d70 V typeinfo for int@CXXABI_1.3
```

NOTE：实际在运用`typeid`的时候，一般会将其转换为人可读的（用`cxxabi.h`库来实现）。比如下面：

> Ask gpt: `cxxabi.h` 是 C++ 标准库中的一个头文件，提供了用于操作 C++ ABI（Application Binary Interface，应用程序二进制接口）的一些函数。
>
C++ ABI 定义了在不同编译器和平台下，C++ 编译器如何生成二进制代码以及如何在不同模块之间进行交互。这包括函数名的重整、异常处理、虚函数表等方面的规范。
>
`cxxabi.h` 中的函数可以用于对符号（比如函数名）进行反解析，将符号的字符串表示形式转换为其内部的实际表示形式，或者反之。
>
其中最常用的函数可能就是 `abi::__cxa_demangle()`，它用于将符号的字符串表示解析成人类可读的形式。
>
举例来说，如果你有一个 C++ 函数名的字符串（例如 "_ZN5MyClass3fooEv"），你可以使用 `__cxa_demangle()` 将其解析成对应的函数名（例如 "MyClass::foo()"）。
>
总的来说，`cxxabi.h` 提供了一些工具，使得在运行时可以对 C++ 符号进行更灵活的处理，这对于某些需要动态获取或者修改函数信息的场景可能会非常有用。 

所以，修改后的代码：

```C++
#include <iostream>
#include <typeinfo>
#include <cxxabi.h>

int main() {
    int x = 10;
    double y = 20.5;

    // 使用typeid获取变量的类型信息
    const std::type_info& typeInfoX = typeid(x);
    const std::type_info& typeInfoY = typeid(y);

    // 使用cxxabi.h中的接口来转换为人类可读形式
    int status;
    char* demangledNameX = abi::__cxa_demangle(typeInfoX.name(), nullptr, nullptr, &status);
    char* demangledNameY = abi::__cxa_demangle(typeInfoY.name(), nullptr, nullptr, &status);

    // 输出转换后的类型名
    std::cout << "Type of x: " << demangledNameX << std::endl;
    std::cout << "Type of y: " << demangledNameY << std::endl;

    // 释放内存
    free(demangledNameX);
    free(demangledNameY);
    return 0;
}
```

得到的结果：
```
Type of x: int
Type of y: double
```

> 注意：不用的编译器，如gnu，clang，MSVC的typeid行为可能不用，详细可见：
> [parallel101/course: 高性能并行编程与优化 - 课件 (github.com)](https://github.com/parallel101/course)


#### 最近用nm干了啥

最近用nm来查看这个库中有没有某个符号（报错出现了`undefined reference`）。最后发现是代码的CMake找错了库 = =!

1. **`U`：未定义符号**，表示该符号在当前目标文件中被引用，但并未在当前目标文件中定义，需要在链接时从其他地方解析。
