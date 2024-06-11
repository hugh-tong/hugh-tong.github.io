---
title: 用doxygen生成类似OpenFOAM的继承关系图和接口手册
date: 2023-09-26 20:00:36
tags:
  - OpenFOAM
  - vscode
---



#### 生成用的指令

1. `doxygen -g  Doxygen.config` ： 会在当前路径下生成一个` Doxygen.config`
    ` Doxygen.config`文件里面有个选项`HAVE_DOT`推荐打开（不打开就是OpenFOAM那种类图，成员变量和函数较多的时候就不打开了），打开了里面有详细的函数。

> 更多设置就要研究这个Doxygen.config啦

2. `doxygen Doxigen.config`：当前路径生成了html
3.  如果在linux下`firefox ./html/index.html`打开，windows直接网页打开，就可以看到了



生成后的（代码中按照一定的注释规范，doxygen会自动识别）：

![图1](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926201828083.png)

这个图就和OpenFOAM的API Guide一样啦

[The OpenFOAM Source Code Guide | OpenFOAM v7 | The OpenFOAM Foundation](https://cpp.openfoam.org/v7/)

> 以前刚开始学OpenFOAM，既不会C++也不会Doxygen，看API Guide简直是痛苦-0 -。 现在自己写个类试一试用doxygen生成一下，对阅读OpenFOAM的API Guide也有帮助（最近在写一个类，感觉类的设计简直是个**规则类怪谈= =!**，等哪天整理整理发出来乐呵一下）

![图2](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926201905884.png)

#### 通过API Guide来看OpenFOAM

以一个OpenFOAM求解器常用的类来看，`createFields.H`中的`fvMesh`。



~~~C++
// createFields.H 
Foam::Info
     << "Create mesh for time = "
     << runTime.timeName() << Foam::nl << Foam::endl;
 
 Foam::fvMesh mesh
 (
     Foam::IOobject
     (
         Foam::fvMesh::defaultRegion,
         runTime.timeName(),
         runTime,
         Foam::IOobject::MUST_READ
     )
 );
~~~



`fvMesh` 这个类继承了`PrimitiveMesh` 和`polyMesh`。

<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926204031953.png" alt="image-20230926204031953" style="zoom:50%;" />



<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926203313291.png" alt="image-20230926203313291" style="zoom:50%;" />



  继续看`PrimitiveMesh` 和`polyMesh`可以发现在顶层的`PrimitiveMesh`，有许多函数定义为`virtual xxx xxxx = 0;`定义成了纯虚的接口，意味着实现应该去他的子类去找。当然，子类也可以用父类已经实现了的函数，所以有时在OpenFOAM找具体在哪儿实现的要套好几层。



<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926204718690.png" alt="看到想用的函数是pure virtual，去他的子类找吧~~" style="zoom:50%;" />



<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230926204825049.png" alt="image-20230926204825049" style="zoom:50%;" />

#### 生成doxygen手册测试用代码

~~~C++
/**
 * @file main.cpp
 * @brief This is a simple C++ program demonstrating Doxygen documentation.
 */

#include <iostream>

/**
 * @brief The base class with a static variable and function.
 */
class Base {
public:
    static int staticVar; /**< A static variable. */

    /**
     * @brief A static function to get the static variable.
     * @return The static variable.
     */
    static int getStaticVar() {
        return staticVar;
    }

    /**
     * @brief A virtual function that prints a message.
     */
    virtual void printMessage() {
        std::cout << "Base class message." << std::endl;
    }

    /**
     * @brief The base class constructor.
     */
    Base() {
        std::cout << "Base class constructor." << std::endl;
    }

    /**
     * @brief The base class destructor.
     */
    virtual ~Base() {
        std::cout << "Base class destructor." << std::endl;
    }
};

int Base::staticVar = 10; // Initialize static variable

/**
 * @brief The derived class that inherits from Base.
 */
class Derived : public Base {
public:
    /**
     * @brief A function that prints a different message.
     */
    void printMessage() override {
        std::cout << "Derived class message." << std::endl;
    }

    /**
     * @brief The derived class constructor.
     */
    Derived() {
        std::cout << "Derived class constructor." << std::endl;
    }

    /**
     * @brief The derived class destructor.
     */
    ~Derived() override {
        std::cout << "Derived class destructor." << std::endl;
    }
};



~~~