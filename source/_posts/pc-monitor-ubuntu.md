---
title: Ubuntu 硬件传感信息查看(CPU 温度/风扇转速)
date: 2026-09-15 16:00:00
categories:
  - [CS]
tags:
  - CS
  - GPU加速
  - Bash
  - Monitor
  - CS
description: Ubuntu 下查看 CPU 温度、风扇转速等传感信息的常用工具。
mathjax: true
---

# Ubuntu 下查看 CPU 温度、风扇转速等硬件传感信息的常用工具

下面按用途分为命令行与图形界面两类，并给出快速上手命令与要点。多数工具依赖内核的 hwmon/ACPI/厂商驱动，若读不到数据，见文末“读不到传感器时的排查”。

---

## 一览表（按硬件/场景）

| 硬件/场景 | 推荐工具（CLI） | 推荐工具（GUI/桌面） |
|---|---|---|
| CPU/主板温度、风扇转速 | lm-sensors（sensors） | Psensor、Vitals（GNOME 扩展）、KDE Plasma System Monitor、Indicator Sensors |
| NVIDIA 显卡温度/风扇 | nvidia-smi | GPU 图形软件（Psensor 也可显示） |
| AMD 显卡温度/风扇 | amdgpu_top、rocm-smi/amd-smi | Psensor/KDE（接入 lm-sensors） |
| NVMe SSD 温度 | nvme-cli（nvme smart-log） | Psensor（经 lm-sensors/hwmon） |
| SATA HDD/SSD 温度 | smartmontools（smartctl） | Psensor |
| 终端面板式总览 | glances、s-tui、bashtop/btop、inxi | Psensor、KDE/GNOME 系统监视器 |
| 服务器带 BMC/IPMI | ipmitool sdr | Web BMC、第三方监控 |

---

## 命令行工具

### 1) lm-sensors（通用：CPU/主板温度与风扇）
- 安装与检测：
  ```bash
  sudo apt update
  sudo apt install lm-sensors
  sudo sensors-detect     # 按提示回车/Yes，加载建议的内核模块
  sensors                 # 查看实时读数
  watch -n1 sensors       # 每秒刷新一次
  ```
- 提示
  - 能显示如 `temp1`, `fan1` 等；是否能读到风速取决于硬件与内核驱动。
  - 读数来源路径可在 `/sys/class/hwmon/hwmon*/` 查看。

### 2) 存储设备温度
- NVMe：
  ```bash
  sudo apt install nvme-cli
  sudo nvme list
  sudo nvme smart-log /dev/nvme0 | grep -i temperature
  ```
- SATA（HDD/SSD）：
  ```bash
  sudo apt install smartmontools
  sudo smartctl -A /dev/sda | grep -i temp
  ```

### 3) 显卡温度与风扇
- NVIDIA：
  ```bash
  nvidia-smi             # 需已安装 NVIDIA 驱动
  nvidia-settings        # 可图形化查看/设置（可选）
  ```
- AMD：
  ```bash
  sudo apt install amdgpu-top        # 部分版本包名为 amdgpu-tools 或在 PPA
  amdgpu_top                         # 交互界面
  # 或（若安装了 ROCm/AMD 工具）
  sudo apt install rocm-smi
  rocm-smi                           # 新版也可用 amd-smi
  ```

### 4) 终端监控与压测联动
- Glances（系统全局 + 传感器）：
  ```bash
  sudo apt install glances
  glances
  ```
- s-tui（温度/频率/功耗/可选压力测试）：
  ```bash
  sudo apt install s-tui stress
  s-tui
  ```

### 5) 服务器/工作站（有 BMC/IPMI）
```bash
sudo apt install ipmitool
sudo ipmitool sdr          # 传感器数据记录，含温度、风扇
```

---

## 图形界面工具

- Psensor（最常用）
  ```bash
  sudo apt install psensor
  psensor
  ```
  - 依赖 lm-sensors，可在托盘显示温度/风速，支持日志/告警。

- GNOME 桌面
  - Vitals 扩展（显示 CPU/GPU/温度/风扇）：安装“扩展”后在扩展网站或 `gnome-extensions-app` 中启用。
  - 系统监视器 + 扩展/插件也可显示部分信息。

- KDE Plasma
  - Plasma System Monitor/KSysGuard：添加“传感器”小组件即可显示温度/风扇。

- Indicator Sensors（顶部面板指示器）
  ```bash
  sudo apt install indicator-sensors
  ```

- xsensors / hardinfo
  - `xsensors` 是 lm-sensors 的极简 GUI；`hardinfo` 可在“传感器”页查看并做基本基准。

---

## 可选：风扇控制（了解即可）
- 若主板/笔电支持，可用 `fancontrol` 配合 `pwmconfig` 调速（风险：不当设置会过热）。
  ```bash
  sudo apt install fancontrol
  sudo pwmconfig
  sudo systemctl enable --now fancontrol
  ```

---

## 读不到温度/风扇时的排查

- 先跑一次探测：
  ```bash
  sudo sensors-detect
  sudo modprobe <提示的内核模块名>
  ```
- 确认常见厂商 ACPI/EC 模块已加载（笔记本常见）：
  - ThinkPad：`thinkpad_acpi`
  - Dell：`dell-smm-hwmon`
  - ASUS：`asus_wmi`
  ```bash
  lsmod | egrep 'thinkpad_acpi|dell|asus|hwmon'
  ```
- 查看内核暴露的 hwmon：
  ```bash
  ls -l /sys/class/hwmon/
  cat /sys/class/hwmon/hwmon*/name
  ```
- 显卡需安装对应专有/开源驱动后才有风扇转速读数（NVIDIA 多为专有驱动）。
- 虚拟机中通常读不到真实温度/风扇。
- 某些笔记本不公开风扇转速传感器，这是硬件/BIOS 限制。

---

## 快速命令合集

```bash
# 通用
sudo apt install lm-sensors psensor
sudo sensors-detect
watch -n1 sensors

# 显卡
nvidia-smi
amdgpu_top      # 或 rocm-smi/amd-smi

# 磁盘
sudo nvme smart-log /dev/nvme0 | grep -i temp
sudo smartctl -A /dev/sda | grep -i temp
```

如果你告诉我使用的硬件（CPU/主板、显卡型号、笔记本品牌型号、Ubuntu 版本），我可以给出更精确的工具组合和操作步骤。
