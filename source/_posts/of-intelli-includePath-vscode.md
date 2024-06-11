---
title: 更新版：OpenFOAM在vscode的代码跳转设置
date: 2023-09-27 15:01:37
tags:
  - OpenFOAM
  - Tools
---



以前写过一些（理解还不太够），主要对法1的具体操作进行更新，

[OpenFOAM代码跳转设置 (qq.com)](https://mp.weixin.qq.com/s?__biz=MzU0OTUwOTAzOQ==&mid=2247485437&idx=1&sn=d9ce41ce9323071e536044215498e409&chksm=fbaf853dccd80c2bf002f159bdb780abd0da1a06c26ac9b5e3053dc0c096ddc0c632008c1cd2&token=1144144318&lang=zh_CN#rd)

代码跳转的本质：**找到这个文件**

- 找到所有OpenFOAM中（编译后）的`lnInclude`所在路径

`find . -name "lnInclude" > tttt.findlnInclude`
	将OpenFOAM所有的`lnInclude`都找到。将所有的`lnInclude`链接都加在includePath中（仅仅加上Make/options下链接到的库还不够，代码中还是有不能跳转的地方）。

VScode: `ctrl + shift + P`， 搜索C++。

​	同理，代码不用编译都可以跳转，在windows下一样的。只要找到合适的lnInclude路径。


- linux下OpenFOAM7的`lnInclude`。`/home/tttt/OpenFOAM`前面替换一下即可。

- 一个例子：`#include <typeinfo>` 是标准库中的头文件，要跳转这个，可以加上C++编译器的includePath，方法如下：



<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230927152604240.png" alt="image-20230927152604240" style="zoom:33%;" />



`gcc -E -v -` 查看这个命令打印信息中的这些：

~~~C++
 /usr/lib/gcc/x86_64-linux-gnu/11/include
 /usr/local/include
 /usr/include/x86_64-linux-gnu
 /usr/include
~~~

将这些粘贴到includePatch中（注意修改前缀）

~~~shell
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/thermalBaffleModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/pyrolysisModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/regionCoupling/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/surfaceFilmModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/surfaceFilmModels/derivedFvPatchFields/wallFunctions/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionModels/regionModel/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/fvMotionSolver/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dynamicFvMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/sampling/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/fvOptions/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/TurbulenceModels/phaseCompressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/TurbulenceModels/incompressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/TurbulenceModels/turbulenceModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/TurbulenceModels/compressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/TurbulenceModels/phaseIncompressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dummyThirdParty/ptscotchDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dummyThirdParty/scotchDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dummyThirdParty/metisDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dummyThirdParty/MGridGen/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/surfMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/conversion/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/ODE/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/radiationModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/incompressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/immiscibleIncompressibleTwoPhaseMixture/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/twoPhaseProperties/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/twoPhaseMixture/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/compressible/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/transportModels/interfaceProperties/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/fvAgglomerationMethods/pairPatchAgglomeration/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/mesh/extrudeModel/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/mesh/snappyHexMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/mesh/blockMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/atmosphericModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/sixDoFRigidBodyState/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/SLGThermo/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/thermophysicalProperties/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/laminarFlameSpeed/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/solidSpecie/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/solidChemistryModel/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/barotropicCompressibilityModel/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/specie/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/basic/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/solidThermo/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/chemistryModel/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/thermophysicalModels/reactionThermo/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/OSspecific/POSIX/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/spray/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/coalCombustion/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/molecularDynamics/molecularMeasurements/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/molecularDynamics/molecule/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/molecularDynamics/potential/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/intermediate/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/DSMC/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/solidParticle/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/distributionModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/turbulence/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/lagrangian/basic/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/rigidBodyState/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/OpenFOAM/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/functionObjects/field/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/functionObjects/lagrangian/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/functionObjects/solvers/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/functionObjects/utilities/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/functionObjects/forces/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/dynamicMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/engine/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/rigidBodyMeshMotion/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/sixDoFRigidBodyMotion/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/randomProcesses/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/meshTools/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/waves/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/fileFormats/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/finiteVolume/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/topoChangerFvMesh/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/regionCoupled/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/Pstream/dummy/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/Pstream/mpi/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/renumber/zoltanRenumber/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/renumber/renumberMethods/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/combustionModels/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/distributed/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/reconstruct/reconstruct/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/decompose/ptscotchDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/decompose/scotchDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/decompose/decompose/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/decompose/decompositionMethods/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/parallel/decompose/metisDecomp/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/rigidBodyDynamics/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/genericPatchFields/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/triSurface/lnInclude/**
/home/tttt/OpenFOAM/OpenFOAM-7/src/semiPermeableBaffle/lnInclude/**


~~~

Windows下（没编没有lnInclde，链到上一个路径也可以，**注意windows和linux的文件分隔符**），这个是**没有编译**，在windows中直接解压从GitHub下载的OpenFOAM包。

```shell
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\thermalBaffleModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\pyrolysisModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\regionCoupling\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\surfaceFilmModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\surfaceFilmModels\derivedFvPatchFields\wallFunctions\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionModels\regionModel\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\fvMotionSolver\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dynamicFvMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\sampling\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\fvOptions\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\TurbulenceModels\phaseCompressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\TurbulenceModels\incompressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\TurbulenceModels\turbulenceModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\TurbulenceModels\compressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\TurbulenceModels\phaseIncompressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dummyThirdParty\ptscotchDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dummyThirdParty\scotchDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dummyThirdParty\metisDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dummyThirdParty\MGridGen\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\surfMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\conversion\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\ODE\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\radiationModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\incompressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\immiscibleIncompressibleTwoPhaseMixture\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\twoPhaseProperties\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\twoPhaseMixture\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\compressible\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\transportModels\interfaceProperties\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\fvAgglomerationMethods\pairPatchAgglomeration\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\mesh\extrudeModel\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\mesh\snappyHexMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\mesh\blockMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\atmosphericModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\sixDoFRigidBodyState\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\SLGThermo\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\thermophysicalProperties\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\laminarFlameSpeed\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\solidSpecie\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\solidChemistryModel\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\barotropicCompressibilityModel\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\specie\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\basic\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\solidThermo\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\chemistryModel\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\thermophysicalModels\reactionThermo\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\OSspecific\POSIX\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\spray\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\coalCombustion\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\molecularDynamics\molecularMeasurements\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\molecularDynamics\molecule\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\molecularDynamics\potential\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\intermediate\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\DSMC\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\solidParticle\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\distributionModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\turbulence\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\lagrangian\basic\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\rigidBodyState\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\OpenFOAM\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\functionObjects\field\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\functionObjects\lagrangian\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\functionObjects\solvers\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\functionObjects\utilities\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\functionObjects\forces\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\dynamicMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\engine\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\rigidBodyMeshMotion\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\sixDoFRigidBodyMotion\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\randomProcesses\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\meshTools\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\waves\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\fileFormats\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\finiteVolume\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\topoChangerFvMesh\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\regionCoupled\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\Pstream\dummy\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\Pstream\mpi\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\renumber\zoltanRenumber\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\renumber\renumberMethods\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\combustionModels\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\distributed\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\reconstruct\reconstruct\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\decompose\ptscotchDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\decompose\scotchDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\decompose\decompose\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\decompose\decompositionMethods\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\parallel\decompose\metisDecomp\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\rigidBodyDynamics\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\genericPatchFields\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\triSurface\**
D:\02_DevProject\00_OpenFOAM\OpenFOAM-7-master\src\semiPermeableBaffle\**

```

设置后的效果：

<img src="https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20231006215430931.png" alt="悬停提示和代码跳转" style="zoom:50%;" />



**类似的可以对Eigen进行同种操作**

- Eigen代码跳转

设置：
```json
/Users/tongyanjun/tttt_file/zz_lib_tttt/eigen-3.4.0/**
```

测试代码：
```c++
#include <iostream>
//这里eigen库可以成功跳转了
#include <Eigen/Dense>
using Eigen::MatrixXd;

int main()
{
MatrixXd m(2,2);
m(0,0) = 3;
m(1,0) = 2.5;
m(0,1) = -1;
m(1,1) = m(1,0) + m(0,1);
std::cout << m << std::endl;

}
```
