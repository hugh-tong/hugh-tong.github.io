---
title: timeVaryingMappedFixedValue 时变映射入口条件
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 边界条件
  - OpenFOAM
  - DES
description: 从预填数据映射时空变化的入口条件:数据组织、映射方式与坑。
mathjax: true
---
[OpenFOAM: API Guide: timeVaryingMappedFixedValueFvPatchField< Type > Class Template Reference](https://www.openfoam.com/documentation/guides/v2206/api/classFoam_1_1timeVaryingMappedFixedValueFvPatchField.html)

[OpenFOAM Documentation: timeVaryingMappedFixedValue (v2312)](https://doc.openfoam.com/2312/tools/processing/boundary-conditions/rtm/derived/meshMotion/timeVaryingMappedFixedValue/)

[Non-uniform time-varying boundary conditions in OpenFOAM : r/CFD](https://www.reddit.com/r/CFD/comments/ogv644/nonuniform_timevarying_boundary_conditions_in/)


# 使用


[How to quickly export points for a timeVaryingFixedValue boundary in OpenFOAM – Alberto Passalacqua](https://www.albertopassalacqua.com/?p=2293)

# timeVaryingMappedFixedValueFvPatchField< Type > Class Template Reference

This boundary condition interpolates values from a set of supplied points in **space and time.**

- points data structure:
    - points: pointField of locations
    - /: field of values at time
- Default operation (mapMethod = planarInterpolation):
    - Projects the points onto a plane (constructed from the first three points)
    - Builds a 2D triangulation
    - For each face centre, finds the containing triangle and interpolation weights to its three vertices
- Optional mapMethod = nearest:
    - Avoids projection/triangulation and uses the value at the nearest vertex
- Values are interpolated linearly between times

## Public Member Types

- typedef DimensionedField< Type, volMesh > Internal  
    The internal field type associated with the patch field.
- typedef fvPatch Patch  
    The patch type for the patch field.
- typedef calculatedFvPatchField< Type > Calculated  
    Type for a calculated patch.

## Public Member Functions

- TypeName("timeVaryingMappedFixedValue")  
    Runtime type information.
    
- Constructors
    
    - timeVaryingMappedFixedValueFvPatchField(const fvPatch& p, const DimensionedField< Type, volMesh >& iF)  
        Construct from patch and internal field.
    - timeVaryingMappedFixedValueFvPatchField(const fvPatch& p, const DimensionedField< Type, volMesh >& iF, const dictionary& dict)  
        Construct from patch, internal field and dictionary.
    - timeVaryingMappedFixedValueFvPatchField(const timeVaryingMappedFixedValueFvPatchField< Type >& ptf)  
        Construct as copy.
    - timeVaryingMappedFixedValueFvPatchField(const timeVaryingMappedFixedValueFvPatchField< Type >& ptf, const fvPatch& p, const DimensionedField< Type, volMesh >& iF, const fvPatchFieldMapper& mapper)  
        Construct by mapping a given timeVaryingMappedFixedValueFvPatchField.
    - timeVaryingMappedFixedValueFvPatchField(const timeVaryingMappedFixedValueFvPatchField< Type >& ptf, const DimensionedField< Type, volMesh >& iF)  
        Construct as copy setting internal field reference.
- Cloning and Mapping
    
    - tmp< fvPatchField< Type > > clone() const  
        Construct and return a clone.
    - tmp< fvPatchField< Type > > clone(const DimensionedField< Type, volMesh >& iF) const  
        Construct and return a clone setting internal field reference.
    - void autoMap(const fvPatchFieldMapper& mapper)  
        Map (and resize if needed) from self, given a mapping object.
    - void rmap(const fvPatchField< Type >& ptf, const labelList& addr)  
        Reverse-map from the given field using addressing.
- Patch Operations
    
    - void updateCoeffs()  
        Update the coefficients associated with the patch field.
    - void write(Ostream&) const  
        Write.

## Usage

- Properties
    
    - setAverage  
        Description: Use average value  
        Required: no  
        Default: false
        
    - perturb  
        Description: Perturb points for regular geometries  
        Required: no  
        Default: 1e-5
        
    - points  
        Description: Name of points file  
        Required: no  
        Default: points
        
    - fieldTable  
        Description: Alternative field name to sample  
        Required: no  
        Default: this field name
        
    - mapMethod  
        Description: Type of mapping  
        Required: no  
        Default: planarInterpolation
        
    - offset  
        Description: Offset to mapped values  
        Required: no  
        Default: Zero
        
- Example
    
    - In a boundary file:
        
        ```
        <patchName>{    type            timeVaryingMappedFixedValue;}
        ```
        

## Inherited Members (selection)

From fixedValueFvPatchField< Type >:

- TypeName("fixedValue")
- Assignment and arithmetic operators:
    - operator=(const Type&)
    - operator+=(const Type&)
    - operator-=(const Type&)
    - operator*=(const scalar)
    - operator/=(const scalar)
    - operator+=(const Field< Type >&)
    - operator-=(const Field< Type >&)
    - operator*=(const Field< scalar >&)
    - operator/=(const Field< scalar >&)
    - operator+=(const fvPatchField< Type >&)
    - operator-=(const fvPatchField< Type >&)
    - operator*=(const fvPatchField< scalar >&)
    - operator/=(const fvPatchField< scalar >&)

From fvPatchField< Type >:

- TypeName("fvPatchField")
- const fvPatch& patch() const  
    Return patch.
- const DimensionedField< Type, volMesh >& internalField() const  
    Return dimensioned internal field reference.
- const Field< Type >& primitiveField() const  
    Return internal field reference.
- operator==(const Field< Type >&)
- operator==(const Type&)
- template tmp< fvPatchField< Type > > NewCalculatedType(const fvPatchField< Type2 >& pf)

From Field< Type > (selection):

- constexpr Field() noexcept

## See Also

- Foam::fixedValueFvPatchField
- Foam::Function1Types

## Source Files

- src/finiteVolume/fields/fvPatchFields/derived/timeVaryingMappedFixedValue/timeVaryingMappedFixedValueFvPatchField.H
- src/finiteVolume/fields/fvPatchFields/derived/timeVaryingMappedFixedValue/timeVaryingMappedFixedValueFvPatchField.C

## Notes

- Definition of the main constructor appears at line 127 of timeVaryingMappedFixedValueFvPatchField.H in the referenced API.


# 【AI-GEN】OpenFOAM v2406 验证案例 atmFlatTerrain 的主要作用

**结论一句话**：`atmFlatTerrain` 用于验证大气边界层（ABL）在平坦地形上的“水平均匀”模拟能力，重点检验地转风驱动、科氏力、粗糙壁面对数定律/Monin–Obukhov相似理论（MOST）壁面通量闭合，以及湍流模型与数值设置能否维持目标的大气边界层剖面。

## 主要验证内容
- **HABL（水平均匀 ABL）维持能力**  
  - 在平坦地面与均匀粗糙度下，解应在水平向保持统计均匀，不出现非物理漂移。
- **地转平衡与科氏力实现**  
  - 通过指定地转风/压力梯度，验证动量方程中科氏力项与湍流剪切可形成正确的埃克曼层结构（Ekman layer），再现实测/理论速度剖面与旋转（Ekman spiral，若启用）。
- **壁面粗糙度与对数律/MOST 边界通量**  
  - 检验粗糙壁面函数（如 `nutkAtmRoughWallFunction`）及 MOST 通量闭合能否给出正确的摩阻速度 $u_*$、壁面剪切与（若启用热/稳定度）热通量。
- **湍流量的一致性**  
  - 目标剖面下的 $k$、$\epsilon$/$\omega$ 等能否保持接近解析/经验平衡解，避免随时间漂移。
- **网格与数值稳健性**  
  - 对网格分辨率、域高度、时间步长与离散格式的敏感性；确认在工程可接受开销下保持 H-HABL。

## 典型设置与对照目标
- **物理项**：地转风/压力梯度、科氏力、粗糙壁面对数律；可选热/稳定度（中性为主，也可扩展到 MOST 稳定/不稳定层结）。
- **边界与域**：平坦地形、周期/远场侧界、足够高的顶界，底部粗糙壁面；初场给定目标 ABL 剖面。
- **对照曲线**：
  - 中性 ABL：对数律 $U(z)=\frac{u_*}{\kappa}\ln\frac{z+d}{z_0}$ 及相应的 $k,\epsilon$ 解析近似；
  - 启用科氏力时：Ekman 层速度幅值与转角；
  - 启用热效应时：MOST 修正（以 Monin–Obukhov 长度 $L$ 为特征）。

## 看结果时关注什么
- **速度剖面与剪切应力**：是否稳定在目标对数律/埃克曼解附近；摩阻速度 $u_*$ 是否匹配设定。
- **湍流量剖面**：$k,\epsilon(\omega)$ 是否接近平衡分布，无系统性漂移。
- **水平均匀性**：沿风向/横向统计量是否平坦，是否出现 spurious 发展。
- **数值稳定性**：时间历史是否快速收敛并保持稳态/准稳态。

## 用途与意义
- 作为大气模块/边界层建模的“基准关卡”，通过后才建议用于复杂地形、风电场、城市风场等算例。
- 为建立风工程/环境流场的可信度提供基础验证（V&V 的 V）。

若你的目标是稳定/不稳定层结或含热通量的情形，可在此基准上启用 MOST 热稳定度项与相应壁面通量设置，检验温度/密度分层对剖面的影响。


# 使用该BC的案例-ofv2406-atmFlatTerrain


## 案例结构


### 总的文件结构

```
$CASE_DIR > tree -L 2
.
├── Allclean
├── Allrun
├── precursor
│   ├── Allclean
│   ├── Allrun
│   ├── plot
│   ├── resources
│   ├── results
│   ├── setups
│   └── setups.orig
└── successor
    ├── Allclean
    ├── Allrun
    ├── results
    ├── setups
    └── setups.orig

```


### boundaryData保存层级


```
$CASE_DIR/successor/results/kEpsilon/constant > tree -L 3
.
├── boundaryData
│   ├── p1
│   │   ├── 0
│   │   └── points
│   ├── p10
│   │   ├── 0
│   │   └── points
│   ├── p11
│   │   ├── 0
│   │   └── points
│   ├── p12
│   │   ├── 0
│   │   └── points
│   ├── p13
```


### 数据内容

#### points

```
(
( 0.00000E+00 0.00000E+00 2.10319E+01 )
( 0.00000E+00 0.00000E+00 2.31246E+01 )
( 0.00000E+00 0.00000E+00 5.93745E+03 )
)
```

####  vector_U

```
(
(4.507730000e+00 1.799630000e+00 0.000000000e+00)
(6.062080000e+00 2.408310000e+00 0.000000000e+00)
(6.874000000e+00 2.720790000e+00 0.000000000e+00)
(1.750000000e+01 6.810450000e-12 0.000000000e+00)
);
```

#### scalar_p

```
(
1.38723
1.46384
1.41511
1.74662e-06
)

```

## 边界条件


### 正则匹配


```
    "p[0-9]+"
    {
        type            freestream;
        freestreamBC
        {
            type        timeVaryingMappedFixedValue;
            offset      (0 0 0);
            setAverage  off;
            mapMethod   nearest;
            value       $internalField;
        }
        value           $internalField;
    }

```


- **这是一个正则表达式（regex）匹配的补丁名键**。在 OpenFOAM v2406 中，边界字段字典里如果用引号包住键名（例如 `"p[0-9]+"`），该键会被当作正则表达式，用来匹配多个补丁名称。
- 表达式 `p[0-9]+` 的含义是：以字母 `p` 开头，后面跟着**至少一个数字**。因此会匹配：
    - 会匹配：`p0`, `p1`, `p10`, `p123` …
    - 不匹配：`p`（没有数字）、`pA`（非数字）、`pp1`（多了个 p）

这样写的目的，是把同一套边界条件（这里是 `type freestream`，内部用 `timeVaryingMappedFixedValue` 作为 `freestreamBC`）一次性应用到所有名字符合该模式的补丁上。

在具体的计算后，会展开为如下示例：

```
    p33
    {
        type            freestream;
        freestreamValue uniform (0 0 0);
        value           nonuniform List<vector> 
500
(
(7.457446548393398 2.964641398762385 5.223392808800714e-06)
(7.456915865429947 2.96466490818745 3.873837912015397e-06)
(7.456483647896063 2.96469855295593 2.583225706079852e-06)
(7.456151220880383 2.964743098383616 1.166777971060303e-06)
```

### 提取某个面的point

```
functions
{
    extractPoints  // Arbitrary name
    {
        type    surfaces;
        libs    (sampling);
        log     true;


        setFormat raw;
        surfaceFormat   foam;


        writeControl    writeTime;
        writeInterval   1;


        fields (U);


        surfaces
        {
            // Oversized sampling - for general testing
            patchSample
            {
                type      patch;
                patches   (inlet);
            }
        }
    }
}
```



## 计算


### 计算过程


```
$CASE_DIR > ./Allrun

# Create the setup: kEpsilon

# Run the setup: kEpsilon

Restore 0/ from 0.orig/
Running blockMesh on $CASE_DIR/precursor/results/kEpsilon
Running renumberMesh on $CASE_DIR/precursor/results/kEpsilon
Running checkMesh on $CASE_DIR/precursor/results/kEpsilon
Running decomposePar on $CASE_DIR/precursor/results/kEpsilon
Running buoyantBoussinesqSimpleFoam (2 processes) on $CASE_DIR/precursor/results/kEpsilon
Running reconstructPar on $CASE_DIR/precursor/results/kEpsilon
Running transformPoints on $CASE_DIR/precursor/results/kEpsilon

## Store the mesh of kEpsilon as the common mesh


# Create the setup: kOmegaSST

# Run the setup: kOmegaSST

## Copy the common mesh to the setup: kOmegaSST

Restore 0/ from 0.orig/
Running decomposePar on $CASE_DIR/precursor/results/kOmegaSST
Running buoyantBoussinesqSimpleFoam (2 processes) on $CASE_DIR/precursor/results/kOmegaSST
Running reconstructPar on $CASE_DIR/precursor/results/kOmegaSST
Running transformPoints on $CASE_DIR/precursor/results/kOmegaSST

# Create the setup: kL

# Run the setup: kL

## Copy the common mesh to the setup: kL

Restore 0/ from 0.orig/
Running decomposePar on $CASE_DIR/precursor/results/kL
Running buoyantBoussinesqSimpleFoam (2 processes) on $CASE_DIR/precursor/results/kL


Running reconstructPar on $CASE_DIR/precursor/results/kL
Running transformPoints on $CASE_DIR/precursor/results/kL

# Create the setup: kEpsilon

# Run the setup: kEpsilon

Restore 0/ from 0.orig/
Running blockMesh on $CASE_DIR/successor/results/kEpsilon
Running topoSet on $CASE_DIR/successor/results/kEpsilon
Running createPatch on $CASE_DIR/successor/results/kEpsilon
Running renumberMesh on $CASE_DIR/successor/results/kEpsilon
Running checkMesh on $CASE_DIR/successor/results/kEpsilon
Running mapFields on $CASE_DIR/successor/results/kEpsilon
Running decomposePar on $CASE_DIR/successor/results/kEpsilon
Running buoyantBoussinesqSimpleFoam (8 processes) on $CASE_DIR/successor/results/kEpsilon
Running reconstructPar on $CASE_DIR/successor/results/kEpsilon

## Store the mesh of kEpsilon as the common mesh


# Create the setup: kOmegaSST

# Run the setup: kOmegaSST

## Copy the common mesh to the setup: kOmegaSST

Restore 0/ from 0.orig/
Running mapFields on $CASE_DIR/successor/results/kOmegaSST
Running decomposePar on $CASE_DIR/successor/results/kOmegaSST
Running buoyantBoussinesqSimpleFoam (8 processes) on $CASE_DIR/successor/results/kOmegaSST
Running reconstructPar on $CASE_DIR/successor/results/kOmegaSST

# Create the setup: kL

# Run the setup: kL

## Copy the common mesh to the setup: kL

Restore 0/ from 0.orig/
Running mapFields on $CASE_DIR/successor/results/kL
Running decomposePar on $CASE_DIR/successor/results/kL
Running buoyantBoussinesqSimpleFoam (8 processes) on $CASE_DIR/successor/results/kL
Running reconstructPar on $CASE_DIR/successor/results/kL
```
