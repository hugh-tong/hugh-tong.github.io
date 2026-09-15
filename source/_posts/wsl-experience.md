---
title: WSL 使用经验(含离线安装)
date: 2026-09-15 16:00:00
categories:
  - [CS]
tags:
  - CS
  - CS
  - LES
  - Git
  - WSL
description: WSL 离线安装与日常使用经验,与站内 zsh 篇互补。
mathjax: true
---

# 离线安装

[Win10 WSL2 手动安装在非C盘 的方法 - ZXYFrank - 博客园](https://www.cnblogs.com/zxyfrank/p/17134500.html)
- 再把 `CanonicalGroupLimited.UbuntuonWindows_2004.2021.825.0\Ubuntu_2004.2021.825.0_x64.appx` 解压缩
- 双击 .exe安装 即可
- **除了.exe 以及 ext4.vhdx，其他都可以删除**

[离线安装WSL的安装包](https://zhuanlan.zhihu.com/p/640621418)

[【调试笔记-20240522-Windows-WSL 修改已安装发行版名称】_wsl 改名-CSDN博客](https://blog.csdn.net/dvd37784302/article/details/139106309)

[旧版 WSL 的手动安装步骤 | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/wsl/install-manual)
## 下载发行版

在某些情况下，你可能无法（或不想）使用 Microsoft 商店安装 WSL 的 Linux 发行版。 你可能正在运行不支持 Microsoft 应用商店的 Windows Server 或 Long-Term 服务 （LTSC） 桌面 OS SKU，或者公司网络策略和/或管理员不允许在环境中使用 Microsoft 应用商店。 在这些情况下，虽然 WSL 本身可用，但可能需要直接下载 Linux 分发版。

如果 Microsoft 应用商店应用不可用，则可以使用以下链接下载并手动安装 Linux 分发版：
- [Ubuntu](https://aka.ms/wslubuntu)
- [Ubuntu 24.04 版本](https://wslstorestorage.blob.core.windows.net/wslblob/Ubuntu2404-240425.AppxBundle)
- [Ubuntu 22.04 LTS](https://aka.ms/wslubuntu2204)
- [Ubuntu 20.04](https://aka.ms/wslubuntu2004)
- [Ubuntu 20.04 ARM](https://aka.ms/wslubuntu2004arm)
- [Ubuntu 18.04](https://aka.ms/wsl-ubuntu-1804)
- [Ubuntu 18.04 ARM](https://aka.ms/wsl-ubuntu-1804-arm)
- [Ubuntu 16.04 版本](https://aka.ms/wsl-ubuntu-1604)
- [Debian GNU/Linux](https://aka.ms/wsl-debian-gnulinux)
- [Kali Linux](https://aka.ms/wsl-kali-linux-new)
- [SUSE Linux Enterprise Server 12](https://aka.ms/wsl-sles-12)
- [SUSE Linux Enterprise Server 15 SP2](https://aka.ms/wsl-SUSELinuxEnterpriseServer15SP2)
- [SUSE Linux Enterprise Server 15 SP3](https://aka.ms/wsl-SUSELinuxEnterpriseServer15SP3)
- [openSUSE Tumbleweed](https://aka.ms/wsl-opensuse-tumbleweed)
- [openSUSE Leap 15.3](https://aka.ms/wsl-opensuseleap15-3)
- [openSUSE Leap 15.2](https://aka.ms/wsl-opensuseleap15-2)
- [Oracle Linux 8.5](https://aka.ms/wsl-oraclelinux-8-5)
- [Oracle Linux 7.9](https://aka.ms/wsl-oraclelinux-7-9)
- [用于 WSL 的 Fedora Remix](https://github.com/WhitewaterFoundry/WSLFedoraRemix/releases/)

这将导致 `<distro>.appx` 包下载到所选文件夹。

如果愿意，还可以通过命令行下载首选分发版，可以将 PowerShell 与 [Invoke-WebRequest](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.utility/invoke-webrequest) cmdlet 配合使用。 例如，若要下载 Ubuntu 20.04，




# WSL磁盘容量限制

## 解决方法（20250825-已实践验证）

[如何管理 WSL 磁盘空间 | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/wsl/disk-space)

Windows在操作了，别忘了在wsl中还需要mount！

## Why has 容量限制？
Q：为什么我的WSL虚拟磁盘ext4.vhdx有容量限制呢，他不应该和我的Windows的硬盘有关，只要我的Windows硬盘下有空间WSL也应该有的吗？

你的这个问题很好，很多 WSL 用户初期都会有类似疑惑。下面详细解释原因：

---

## 1. **WSL2 的存储原理**

- **WSL2** 是通过一个**虚拟硬盘**（`ext4.vhdx` 文件）来模拟 Linux 的根文件系统。
- 这个文件存储在 Windows 的 `C:\Users\<用户名>\AppData\Local\Packages\<发行版>\LocalState\ext4.vhdx` 路径下。
- **WSL2 的 Linux 子系统所有数据**（除挂载的 `/mnt/c` 等 Windows 磁盘）都只存储在这个虚拟磁盘里。

---

## 2. **WSL2 虚拟磁盘和 Windows 硬盘的关系**

- 虚拟磁盘（`ext4.vhdx`）本质上就是一个很大的文件，存在 Windows 文件系统中。
- 虽然你 Windows 的硬盘有充足空间，但**虚拟盘会有自己的容量限制**，就像你插了一个大小定死的U盘/移动硬盘。
- WSL2 默认创建时，虚拟盘最大 256G，Ubuntu 22.04 新版上限是 1T（但初始只有你用多少就长多少，不会一下子吃满空间）。

---

## 3. **为什么有限制？**

- WSL2 的 `ext4.vhdx` 虚拟磁盘格式是动态扩展的，但**有最大容量上限**，这个上限和发行版、创建参数相关。
- 一旦达到这个最大值（比如 250G），**WSL2 里的 Linux 系统就像自己的磁盘满了一样，不能无限长大**。  
- 你在 WSL 里看到的 `/`，就是这块虚像磁盘。和实际 Windows 剩余空间无直接绑定。

---

## 4. **和挂载盘的区别**

- `/mnt/c`、`/mnt/d` 等，是把 Windows 的实际磁盘直接挂到 WSL2 里用，如果你在这些路径下存文件，就不受 `ext4.vhdx` 限制，只要 Windows 有空间即可。
- 而 WSL2 默认的 `~` 或 `/home/xxx`、`/usr` 等等，全部在那块 ext4.vhdx 虚拟盘里，空间打满了只能清理/扩容。

---

## 5. **如何解决磁盘打满**

- 清理不必要文件。
- 或者像上面所说的——扩容现有 ext4.vhdx 文件。
- 或者将大数据放到 `/mnt/c` 这种目录下。

[WSL安装、迁移及修改默认登录用户_wsl设置默认登录用户-CSDN博客](https://blog.csdn.net/saladpie/article/details/144007153)

WSL查看磁盘可用空间：

```
wsl.exe --system -d Ubuntu-20.04 df -h /mnt/wslg/distro
```


---

## 6. **简化理解**

- WSL2 虚拟磁盘 = 一个本地 Linux 专用的“大文件”，和你 Windows 磁盘物理空间是**间接相关**（有空余才能增长），但逻辑上是个“独立开辟的区域”，空间大小你可以手动扩展，系统**不会自动和 C 盘等实际剩余空间完全同步**。

---

### 总结

- **WSL2 的 Linux 系统空间（比如`/home`）只受它当前的 ext4.vhdx 最大大小制约**，和 Windows 剩余空间不是“同步增长”的关系。
- 只要你的 `ext4.vhdx` 没有扩容，哪怕 Windows 还剩几百G，你 WSL2 里也可能爆满。
- 如你空间打满，请扩容 vhdx，或者将数据迁移到 `/mnt/c` 下等挂载的 Windows 分区。

如需扩容详细操作可继续问！



# Linux下怎么查看占用磁盘空间最大的十个文件夹？

以下是针对您的查询“Linux下怎么查看占用磁盘空间最大的十个文件夹？”的详细解答。Linux提供了多种命令行工具来实现这个功能，我会优先介绍最简单、标准的命令（无需额外安装），然后提及一些高级或交互式工具。操作需要在终端（Terminal）中执行。

### 1. **使用标准命令（du + sort + head）**
最常用的是`du`命令（disk usage），结合排序和截取前10个结果。这适用于大多数Linux发行版（如Ubuntu、CentOS、Fedora）。

#### 基本命令
要查看指定目录（如根目录`/`）下占用空间最大的10个一级子文件夹：
```
du -h --max-depth=1 / | sort -rh | head -n 11 | tail -n 10
```
- **解释**：
  - `du -h --max-depth=1 /`：计算指定路径（这里是根目录`/`）下所有一级子目录的磁盘占用大小。`-h` 表示人类可读格式（e.g., 1.2G 而非字节数）；`--max-depth=1` 限制只显示一级深度（避免递归太深）。
  - `sort -rh`：对输出进行排序。`-r` 表示逆序（从大到小）；`-h` 支持人类可读数字排序。
  - `head -n 11 | tail -n 10`：`du` 的输出第一行是当前目录的总大小，所以用 `head -n 11` 取前11行，然后 `tail -n 10` 排除第一行，只显示前10个子文件夹。

- **示例输出**（假设在根目录运行）：
  ```
  50G    /home
  20G    /var
  10G    /usr
  5G     /opt
  2G     /etc
  1G     /tmp
  500M   /boot
  100M   /root
  50M    /lib
  10M    /sbin
  ```

#### 自定义路径
- 如果想查看当前目录下的前10个文件夹：替换 `/` 为 `.`（当前目录）。
  ```
  du -h --max-depth=1 . | sort -rh | head -n 11 | tail -n 10
  ```
- 查看特定目录（如`/home`）：
  ```
  du -h --max-depth=1 /home | sort -rh | head -n 11 | tail -n 10
  ```

#### 注意事项
- **权限问题**：如果目录需要root权限（如根目录`/`），在命令前加`sudo`：
  ```
  sudo du -h --max-depth=1 / | sort -rh | head -n 11 | tail -n 10
  ```
- **深度调整**：如果想查看更深层级的文件夹（e.g., 所有子目录），去掉`--max-depth=1`，但这可能会很慢（尤其在大分区上）。
- **包括文件**：默认`du` 只统计目录；如果想包括单个文件，用`du -ah`（`-a` 显示所有文件和目录）。
- **性能**：在大型文件系统上运行可能耗时，可以加`--exclude` 排除某些目录（e.g., `--exclude=/proc`）。

### 2. **使用更高级的工具（推荐安装）**
如果您经常需要这个功能，考虑安装交互式工具，更易用。

- **ncdu**（NCurses Disk Usage，交互式工具）：
  - 安装：`sudo apt install ncdu`（Debian/Ubuntu）或 `sudo yum install ncdu`（CentOS/RHEL）或 `sudo dnf install ncdu`（Fedora）。
  - 使用：`ncdu /`（或指定路径如`ncdu /home`）。
  - 功能：进入交互界面，按大小排序文件夹，用箭头导航、删除文件等。退出按`q`。它会自动显示占用最大的文件夹。

- **duf**（Disk Usage/Free Utility，现代替代）：
  - 安装：从GitHub下载（https://github.com/muesli/duf）或用包管理器（如`sudo apt install duf` 如果可用）。
  - 使用：`duf /`。它以表格形式显示分区和文件夹大小，按大小排序。

- **tree**（结合大小显示）：
  - 安装：`sudo apt install tree`。
  - 使用：`tree -h --du /path | sort -rh | head -n 10`（但不如du直接）。

### 3. **其他提示**
- **图形化工具**：如果不喜欢命令行，用`baobab`（GNOME Disk Usage Analyzer，安装`sudo apt install baobab`）或`kdirstat`/`qdirstat`（KDE版本）。这些是GUI工具，能可视化显示文件夹大小。
- **脚本化**：如果需要自动化，可以写个Bash脚本保存命令，并定期运行。
- **常见问题**：
  - 如果命令报错“sort: invalid option -- 'h'”，可能是旧版sort不支持`-h`，升级系统或用`sort -rn`（数字排序，但需去掉`-h`）。
  - 在WSL（Windows Subsystem for Linux）下运行类似，但注意Windows文件系统的挂载可能影响准确性。

这个方法应该能帮您快速找到占用空间大的文件夹。如果您有特定Linux发行版或其他要求（如递归显示所有层级），告诉我，我可以进一步调整！


以下是针对Linux系统（适用于大多数发行版，如Ubuntu、Debian、CentOS、Fedora等）配置GitHub SSH Key的全过程教程。SSH Key是一种安全的认证方式，能让你在不输入用户名/密码的情况下与GitHub进行Git操作（如clone、push、pull），比HTTPS更安全和方便。


# 生成ssh-key用于github
### 为什么使用SSH Key？
- **安全性**：使用公钥/私钥对加密，避免明文密码传输。
- **便利性**：无需每次操作输入凭证。
- **前提条件**：
  - 已安装Git（运行`git --version`检查；如果没有，安装：Ubuntu用`sudo apt install git`；CentOS/Fedora用`sudo yum install git`或`sudo dnf install git`）。
  - 已安装SSH客户端（通常默认有；检查`ssh -V`；如果没有，安装：Ubuntu用`sudo apt install openssh-client`）。
  - 你有一个GitHub账号。

如果您是初次配置，跟着步骤走即可。整个过程在终端（Terminal）中完成，通常只需5-10分钟。

### 步骤1: 检查是否已有SSH Key
在配置新Key前，先检查是否已有现有的SSH Key。
```
ls -al ~/.ssh
```
- 如果看到`id_rsa`（私钥）和`id_rsa.pub`（公钥），说明已有Key，可以跳到步骤4复用它。
- 如果目录为空或不存在，继续生成新Key。

### 步骤2: 生成新的SSH Key
使用`ssh-keygen`命令生成RSA密钥对（推荐4096位强度）。
1. 运行命令：
   ```
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```
   - `-t rsa`：指定RSA类型（GitHub支持）。
   - `-b 4096`：密钥长度（更高安全性；默认是3072）。
   - `-C "your_email@example.com"`：添加注释（用你的GitHub邮箱，便于识别）。

2. 系统会提示保存位置：按Enter接受默认（`~/.ssh/id_rsa`）。
3. 系统会提示输入密码短语（passphrase）：推荐输入一个强密码（用于保护私钥），或按Enter跳过（不推荐，但更方便）。确认两次。

- 生成后，你会在`~/.ssh`目录看到：
  - `id_rsa`：私钥（绝不要分享！）。
  - `id_rsa.pub`：公钥（稍后上传到GitHub）。

### 步骤3: 添加SSH Key到SSH Agent（可选，但推荐）
SSH Agent管理你的Key，确保在会话中自动使用。
1. 启动SSH Agent（如果未运行）：
   ```
   eval "$(ssh-agent -s)"
   ```
   - 输出类似`Agent pid 1234`表示成功。

2. 添加私钥到Agent：
   ```
   ssh-add ~/.ssh/id_rsa
   ```
   - 如果设置了passphrase，会提示输入。

- **注意**：这只在当前终端会话有效。如果想永久化，编辑`~/.bashrc`或`~/.zshrc`（取决于你的Shell），添加`eval "$(ssh-agent -s)"`和`ssh-add`命令，然后运行`source ~/.bashrc`。

### 步骤4: 将公钥添加到GitHub账号
1. 复制公钥内容到剪贴板：
   ```
   cat ~/.ssh/id_rsa.pub
   ```
   - 输出类似`ssh-rsa AAAAB3NzaC1yc2E... your_email@example.com`。复制整个内容（包括`ssh-rsa`开头和邮箱结尾）。

   - 或者用`xclip`工具（如果安装：`sudo apt install xclip`），运行`xclip -sel clip < ~/.ssh/id_rsa.pub`自动复制。

2. 登录GitHub网站（https://github.com）：
   - 点击右上角头像 > Settings（设置）。
   - 左侧菜单：SSH and GPG keys。
   - 点击"New SSH key"（新建SSH Key）。
   - Title：输入一个描述（如"My Linux Laptop"）。
   - Key：粘贴刚才复制的公钥内容。
   - 点击"Add SSH key"。

3. 如果提示2FA（两因素认证），确认身份。

### 步骤5: 测试SSH连接
验证配置是否成功。
1. 运行：
   ```
   ssh -T git@github.com
   ```
   - 如果首次连接，会提示`Are you sure you want to continue connecting (yes/no)?` 输入`yes`。
   - 成功输出：`Hi username! You've successfully authenticated, but GitHub does not provide shell access.`（username是你的GitHub用户名）。
   - 如果失败，见下面的故障排除。

2. 测试Git操作：
   - Clone一个仓库：`git clone git@github.com:username/repo.git`（替换为你的仓库）。
   - 如果无需密码即成功，配置OK。

### 步骤6: 配置Git使用SSH（如果需要）
如果你的仓库URL是HTTPS，切换到SSH：
1. 检查当前远程URL：`git remote -v`。
2. 更改为SSH：`git remote set-url origin git@github.com:username/repo.git`。

此外，在`~/.gitconfig`中设置全局用户名/邮箱（可选，但推荐）：
```
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

### 常见问题和故障排除
- **命令不存在**：确保安装了git和openssh-client。
- **Permission denied (publickey)**：公钥未正确添加，或私钥权限不对。运行`chmod 600 ~/.ssh/id_rsa`修复权限。
- **ssh-add失败**：如果Agent未运行，先运行`eval "$(ssh-agent -s)"`。
- **连接超时**：检查网络/防火墙；或用`ssh -v git@github.com`查看详细日志。
- **多个Key管理**：如果有多个Key，编辑`~/.ssh/config`添加：
  ```
  Host github.com
      IdentityFile ~/.ssh/id_rsa
  ```
- **WSL（Windows Subsystem for Linux）特殊**：WSL下配置类似，但确保Windows的SSH Agent未冲突；有时需重启WSL。
- **旧Key冲突**：如果有多个Key，用`ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_rsa`生成特定文件名的Key，然后在GitHub添加对应公钥。

### 额外提示
- **安全性**：私钥绝不分享；定期备份`~/.ssh`目录；启用GitHub的2FA。
- **更新Key**：如果邮箱变了，生成新Key并更新GitHub。
- **参考资源**：GitHub官方文档（https://docs.github.com/en/authentication/connecting-to-github-with-ssh）；运行`man ssh-keygen`查看命令帮助。
- **如果用ED25519**（更现代算法）：替换步骤2为`ssh-keygen -t ed25519 -C "your_email@example.com"`（GitHub支持）。

如果在任何步骤遇到错误，复制错误消息告诉我，我可以帮你调试！这个配置完成后，你就可以无缝使用GitHub了。


# TMUX常用指令


以下是tmux（Terminal Multiplexer，一个强大的终端多路复用工具，常用于Linux/Unix系统）的常用命令指南。tmux允许你在单个终端窗口中管理多个会话、窗口和窗格，支持会话持久化、窗口分割等功能，非常适合服务器远程工作或多任务处理。

### 重要提示
- **默认前缀键**：tmux的快捷键通常以`Ctrl-b`（简称`<prefix>`）开头，按下`Ctrl-b`后释放，然后按后续键（e.g., `Ctrl-b c` 创建新窗口）。
- **命令模式**：按`<prefix> :` 进入命令行模式，然后输入命令（e.g., `new-session`）。
- **安装**：如果未安装，Ubuntu用`sudo apt install tmux`；CentOS用`sudo yum install tmux`。
- **配置文件**：自定义配置在`~/.tmux.conf`（e.g., 改前缀为`Ctrl-a`：`set -g prefix C-a`）。
- **帮助**：在tmux中按`<prefix> ?` 查看所有绑定键；或运行`man tmux`。

我将命令按类别分组，列出快捷键和等效命令行形式。假设您已在终端运行`tmux`启动会话。

### 1. 启动和会话管理
- 启动tmux：`tmux` 或 `tmux new -s session_name`（创建名为session_name的会话）。
- 附加到现有会话：`tmux attach -t session_name`（或`tmux a` 附加最后一个）。
- 列出会话：`tmux ls`（命令行）或`<prefix> s`（在tmux内）。
- 重命名当前会话：`<prefix> $` 或 `:rename-session new_name`。
- 分离当前会话：`<prefix> d`（detach，回到普通终端；会话在后台运行）。
- 杀死会话：`tmux kill-session -t session_name` 或在会话内`<prefix> &` 杀死当前窗口的所有会话。
- 新建会话：`<prefix> :new`（在当前tmux内创建新会话）。

### 2. 窗口管理（类似标签页）
- 创建新窗口：`<prefix> c`。
- 切换到下一个窗口：`<prefix> n` 或 `<prefix> l`（最后一个活动窗口）。
- 切换到上一个窗口：`<prefix> p`。
- 选择窗口（列表）：`<prefix> w`。
- 重命名当前窗口：`<prefix> ,`。
- 关闭当前窗口：`<prefix> &`（确认后关闭）。
- 查找窗口：`<prefix> f`（输入关键词搜索）。
- 切换到指定窗口：`<prefix> 0-9`（数字键，切换到第N个窗口）。

### 3. 窗格管理（窗口分割）
- 水平分割窗格：`<prefix> "`（将当前窗格分成上下两部分）。
- 垂直分割窗格：`<prefix> %`（分成左右两部分）。
- 切换窗格：`<prefix> 箭头键`（上/下/左/右）或`<prefix> o`（循环切换）。
- 关闭当前窗格：`<prefix> x`（确认后关闭）。
- 调整窗格大小：`<prefix> Ctrl-箭头键`（按住Ctrl调整边界）。
- 全屏当前窗格（切换）：`<prefix> z`（zoom/unzoom）。
- 重新排列窗格：`<prefix> Space`（循环布局，如主-从、平铺）。
- 交换窗格位置：`<prefix> {`（与上一个交换）或`<prefix> }`（与下一个）。


### 4. 复制和粘贴模式（Vi模式推荐）

- 进入复制模式：`<prefix> [`（然后用箭头键导航）。
- 开始选择文本（Vi模式）：在复制模式下，按`v`（visual mode），用箭头移动选择。
- 复制选中文本：按`y`（yank）或Enter。
- 粘贴：`<prefix> ]`。
- 滚动历史：复制模式下，用PageUp/PageDown或鼠标滚轮（如果启用）。
- **提示**：在`~/.tmux.conf`添加`set -g mode-keys vi` 以启用Vi风格键绑定（更高效）。

### 5. 其他常用命令
- 重新加载配置：`<prefix> r`（需在配置中添加`bind r source-file ~/.tmux.conf`）。
- 分割窗口成网格布局：`<prefix> Alt-1` 到 `Alt-5`（不同布局）。
- 同步窗格输入：`<prefix> :setw synchronize-panes`（在所有窗格同时输入）。
- 捕获窗格输出到文件：`<prefix> :capture-pane -S - -E -`（捕获所有历史）。
- 鼠标支持：`<prefix> :set -g mouse on`（启用鼠标点击/拖拽窗格/滚动）。
- 杀死服务器（关闭所有会话）：`tmux kill-server`。
- 显示时钟：`<prefix> t`（临时显示大时钟）。
- 自定义键绑定：在配置中添加如`bind-key C-j resize-pane -D 10`（自定义调整大小）。

### 示例工作流
1. 启动：`tmux new -s mysession`。
2. 创建窗口：`<prefix> c`。
3. 分割窗格：`<prefix> %`（垂直）。
4. 运行命令：在窗格中运行如`top`或`vim`。
5. 分离：`<prefix> d`。
6. 重新附加：`tmux a -t mysession`。

### 高级提示
- **自定义配置**：编辑`~/.tmux.conf`，例如：
  ```
  set -g prefix C-a  # 改前缀为Ctrl-a
  unbind C-b
  set -g mouse on    # 启用鼠标
  set -g history-limit 50000  # 增加历史行数
  ```
  保存后，运行`tmux source ~/.tmux.conf` 或重启tmux。
- **插件**：用tmux插件管理器（如tpm：https://github.com/tmux-plugins/tpm）添加扩展，如tmux-resurrect（保存/恢复会话）。
- **常见问题**：如果快捷键无效，检查是否在嵌套tmux中（用`<prefix><prefix>`发送前缀）；或用`tmux -v`调试。

这些是tmux的最常用命令，覆盖80%的日常使用。如果您需要特定场景的命令（如服务器部署）或配置示例，告诉我，我可以扩展！更多细节见`man tmux`或官网（https://github.com/tmux/tmux/wiki）。

# 多个WSL只关闭一个

`wsl --shutdown` 这个命令在 Windows 的 WSL（Windows Subsystem for Linux）环境下的实际作用是：

### 作用

- **`wsl --shutdown` 会关闭所有正在运行的 WSL 实例**，而不是只关闭单独的某一个。
- 包括所有分发版（比如 Ubuntu、Debian、Kali 等），所有正在运行的 WSL 2 虚拟机和 WSL 1 实例，都会被一起终止。
- 这也会释放掉被相关 WSL 虚拟机占用的内存资源。
- 执行后，再进入 `wsl` 或启动具体发行版，会重新启动新的 WSL 实例。

---

### 如果你只想关闭/终止**某一个**WSL发行版

可以使用以下命令：

```bash
wsl --terminate <发行版名称>
```

比如：

```bash
wsl --terminate Ubuntu-20.04
```
这样只会关闭名为“Ubuntu-20.04”的那个 WSL 分发版，其他的不受影响。

---

**总结：**
- `wsl --shutdown` 关闭所有WSL实例。
- `wsl --terminate <Name>` 只关闭指定的某一个实例。

如果有更多关于 WSL 的问题，欢迎继续提问！

# Windows上删除某个WSL版本

```
wsl --unregister Ubuntu-22.04
```

> wsl在Windows中unregister后，硬盘空间立马就腾出来了，其背后的原理是什么？


非常棒的问题 👍，这个现象确实容易让人好奇。  
当你在 Windows 上执行：

```bash
wsl --unregister <发行版名称>
```

后，**磁盘空间几乎“立刻”就释放**出来，这其实是因为 ——

> WSL 的每个发行版（Linux 实例）在 Windows 上只是一个文件（虚拟磁盘映像），  
> `--unregister` 命令删除的就是这个大文件。

---

## 🔬 一、核心原理：WSL 的文件系统是一个 VHDX 虚拟磁盘文件

当你安装一个 WSL 发行版（例如 Ubuntu-22.04），实际上 Windows 会在你的用户目录下创建一个虚拟磁盘文件：

```
%LOCALAPPDATA%\Packages\<发行版包名>\LocalState\ext4.vhdx
```

比如：

```
C:\Users\<用户>\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu22.04onWindows_79rhkp1fndgsc\LocalState\ext4.vhdx
```

这个文件就是 WSL 的 **完整 Linux 文件系统镜像**（ext4 文件系统容器）。

所有你在 WSL 里创建的文件、安装的软件、apt 下载的包，都存储在这个 VHDX 里。

- 它通常采用 **稀疏文件(sparse file)** 格式；
- Windows NTFS 会“按需分配”磁盘空间。

👉 因此 “你的整个 WSL 系统” 本质上就是一个单独的文件！

---

## 💥 二、unregister 做了什么？

执行：

```bash
wsl --unregister Ubuntu-22.04
```

这条命令会：

1. 停止该发行版的所有正在运行的进程；
2. 从注册表中删除该发行版的映射信息；
3. 删除对应的文件夹路径：
    
    ```
    %LOCALAPPDATA%\Packages\CanonicalGroupLimited.Ubuntu22.04onWindows_79rhkp1fndgsc\
    ```
    
4. 也就同时删除了里面的 `ext4.vhdx` 文件。

---

## ⚙️ 三、那么为什么“空间立马释放”？

因为这个 `.vhdx` 文件可能占几十 GB，是在 **NTFS 文件系统上作为一个单一文件** 持有的。  
当 `wsl --unregister` 删除它时：

- Windows 直接删除该 VHDX 文件；
- 操作系统立即回收它所占用的空间；
- 不需要像 ext4 删除文件那样清理块结构；
- 所以看起来“瞬间腾出几十 GB”。

👉 这跟你在 Windows 上删除一个 30 GB 的电影文件类似，删除操作只是移除了文件表项，系统立即统计为“腾出空间”。

---

## 🧩 四、可视化：

| 操作                 | 文件系统变化              | 空间变化      |
| ------------------ | ------------------- | --------- |
| 安装 WSL 发行版         | 创建 `ext4.vhdx` 文件   | 占用磁盘空间    |
| 使用 Linux、安装软件      | 向该虚拟磁盘写入数据          | VHDX 文件变大 |
| `wsl --unregister` | 删除整个 `ext4.vhdx` 文件 | 空间立即释放    |
|                    |                     |           |

---

## 🧱 五、补充知识：导出 / 备份机制

在删除前，你可以先导出备份整个 VHDX 文件内容：

```bash
wsl --export Ubuntu-22.04 D:\backup\ubuntu22.tar
```

然后删除：

```bash
wsl --unregister Ubuntu-22.04
```

若以后想恢复：

```bash
wsl --import Ubuntu-22.04 D:\WSL\Ubuntu22 D:\backup\ubuntu22.tar
```

这一来一回的过程，其实就是压缩 / 解压 `.vhdx` 文件。

---

## 💡 六、总结一句话：

> `wsl --unregister` 删除的不是一堆小文件，而是一个巨大的虚拟磁盘文件（ext4.vhdx），  
> 所以 **Windows 文件系统能瞬间回收整个空间**，看上去就像“硬盘空间立刻腾出来了”。

---

# WSL导出

你可以利用 `wsl --export` 和 `wsl --import` 命令，将 WSL 发行版从一台电脑迁移到另一台，方法如下：

---

## 一、导出（Export）

在源（导出）电脑的 PowerShell、CMD 或 Windows Terminal 里：

1. **查找现有的发行版名称：**
   ```bash
   wsl --list --verbose
   ```
   比如，你要迁出的发行版是 `Ubuntu-20.04`。

2. **导出发行版为 .tar 文件：**
   ```bash
   wsl --export Ubuntu-20.04 D:\backup\ubuntu20.tar
   ```
   > 上述命令会把整个 Ubuntu-20.04 环境打包到 `D:\backup\ubuntu20.tar`，包括所有已安装的软件、文件、配置等。

---

## 二、迁移/导入（Import）

在目标（导入）电脑上：

1. **把 `ubuntu20.tar` 拷贝到本地，比如 `D:\backup\ubuntu20.tar`。**
2. **选择一个安装目录（空目录），比如 `D:\WSL\Ubuntu20`。**
3. **导入发行版：**
   ```bash
   wsl --import Ubuntu-20.04 D:\WSL\Ubuntu20 D:\backup\ubuntu20.tar
   ```
   > 这样会以新的分发名“Ubuntu-20.04”在指定文件夹创建 WSL 环境。

---

## 三、使用

导入成功后，可以用以下命令进入新环境：
```bash
wsl -d Ubuntu-20.04
```
或在 Windows Terminal 新建标签选择相应发行版。

---

## 注意事项与限制

1. **操作系统一致性**  
   迁移包中内容与内核紧密相关，通常建议目标电脑上的 WSL 版本（WSL 2/WSL 1）保持一致；但一般情况下互相兼容问题不大。

2. **WSL 配置独立**  
   `.wslconfig`、网络配置、挂载设置等是每台 Windows 独立的，不会跟着导出/导入，要重新设置。

3. **路径变化**  
   导入时可以选新的存放路径；导出的 `.tar` 文件只是文件系统打包，由你指定安装地点。

4. **Windows 与 Linux 的映射路径**  
   用户的个人文件和配置、软件都会迁入新电脑，但 Windows 原有的磁盘（如 `/mnt/c/` 下修改的文件）并不会一起导出来，只导 Linux 子系统自身内容。

5. **网络与权限**
   某些涉及主机网络、端口转发、外部程序调用等由 Windows 管理部分，需要在新机单独配置。

6. **用户名与用户ID**
   旧发行版默认用户、UID 会一同迁移，如果导入电脑已有同名发行版/同名用户，需注意重名冲突或清理。

---

## 总结

- 利用 `wsl --export`（导出）和 `wsl --import`（导入）即可在不同电脑间迁移 WSL 环境。
- 除了 WSL 本身的高级配置不迁移外，大部分发行版内的内容都能完整打包和恢复。
- 通常不存在特别的限制，流程相对简单。

如需详细操作或有特殊需求（比如定制迁移方案、多分发版本处理等），欢迎补充追问！
