---
title: 学习在fluent和OpenFOAM中设置压力边界条件
date: 2023-08-28 23:40:17
tags:
  - OpenFOAM
---

update:

[[CFD] When and Why do I need Operating Pressure, Temperature and Density? - YouTube](https://www.youtube.com/watch?v=zFDDhXEsIZ4)

>为什么需要Operating Pressue

补充关于压力出入口边界设置的资料：

[ANSYS FLUENT 12.0 User's Guide - 7.3.3 Pressure Inlet Boundary Conditions (enea.it)](https://www.afs.enea.it/project/neptunius/docs/fluent/html/ug/node239.htm)

！！[[CFD\] Pressure-Inlet Boundary Conditions - YouTube](https://www.youtube.com/watch?v=Er2j5Kq17as)

> 讲的超好！里面有对不同速度工况下（不可压，可压，其中可压又分为亚音速和超音速）压力入口的设置



[一个视频理解Ansys Fluent里的压力设置及含义（表压or静压）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV12s4y1j7vs/?spm_id_from=333.337.search-card.all.click&vd_source=c32136bd36d786f2220cfc980f5de7c2)

- Operating Condition
  - Operating Pressure[Pa] +Gauge Pressure(Relative Pressure, Static Pressure)
    $P_{absolute} = P_{operating}+P_{gauge}$
     The gauge pressure is what we enter in the Boundary conditions panels. Set the gauge pressure is used to avoid problems with round-off errors which occur when the dynamic pressure differences in a fluid are small compared to the absolute pressure level

- Reference pressure location, is where the absolute static pressure is known



![image-20230828222040140](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20230828222040140.png)







[Reference pressure in OpenFOAM -- CFD Online Discussion Forums (cfd-online.com)](https://www.cfd-online.com/Forums/openfoam-solving/76073-reference-pressure-openfoam.html)

```
In others the reference is set only if required.

Quote:

*In fluent, if we specify pref=1atm, then if we entering a guage perssure of 0 atm at outlet then we can directly enter the value 0.  even if I am giving the perssure boundary condition p=0 at outlet, there wont be any wrong in specifying the pref value = 0 in tne fvSolution file, right?*

Right, since you're solving for incompressible flows. As long as you do not over-specify the boundary (setting p and U at the same side, for example), it will be fine. The only difference could be a translation of the values of p.
```

这个算例里面有句话值得注意：over-specify！(setting p and U at the same side)



**ASK GPT:**

In OpenFOAM, when setting up a boundary condition with a constant mass flow rate velocity, you usually need to also specify an appropriate pressure boundary condition to ensure the problem is well-posed and physically accurate. The choice of pressure boundary condition depends on the specific problem and flow conditions. Here are a few options you can consider:

1. **Inlet/Outlet Pressure:** You can use the `inletOutlet` boundary condition for pressure at the inlet or outlet. This condition allows the pressure to be determined based on the velocity field and the specified mass flow rate, ensuring that the flow is consistent with the desired mass flow rate.

   ```cpp
   inletOutlet
   {
       type inletOutlet;
       inletValue uniform (0 0 0); // Specify the velocity components
       value $internalField; // To set pressure equal to internalField
   }
   ```

2. **Fixed Value or Fixed Gradient:** Depending on the flow problem, you might be able to set a fixed value or fixed gradient for the pressure at the boundary. However, ensure that the boundary conditions do not lead to unphysical results.

   ```cpp
   fixedValue
   {
       type fixedValue;
       value $internalField; // Specify the desired pressure value
   }
   ```

   ```cpp
   fixedGradient
   {
       type fixedGradient;
       gradient uniform (0 0 0); // Specify a gradient if needed
   }
   ```

3. **Zero Gradient:** For some cases, you might use a zero gradient condition for pressure at the boundary. This assumes that the pressure gradient is zero, which might be suitable if the boundary is far from the region of interest or if you have a long enough domain.

   ```cpp
   zeroGradient
   {
       type zeroGradient;
   }
   ```

4. **Pressure Inlet:** If you have a known pressure value at the inlet, you can directly specify that value. However, this might affect the mass flow rate, so ensure consistency with your velocity boundary condition.

   ```cpp
   pressureInlet
   {
       type pressureInlet;
       p uniform 101325; // Specify the pressure value
       U uniform (0 0 0); // Specify the velocity components
   }
   ```

Remember to select a pressure boundary condition that is consistent with your desired mass flow rate velocity condition and that reflects the physics of your problem. Always validate your choice through simulations and comparisons with experimental or analytical results if available.
