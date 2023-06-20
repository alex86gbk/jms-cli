![image](https://user-images.githubusercontent.com/1990992/48991215-fbea5300-f16c-11e8-8f0c-63c381cd581f.png)

# jms-cli

> js-multi-seed 标准开发/管理工具

### 开始使用

安装:

```bash
npm install -g jms-cli
```

验证是否安装成功，在命令行键入 `jms`

![image](https://user-images.githubusercontent.com/1990992/56626474-6350f400-6674-11e9-8a53-b1833020703d.png)

创建一个新项目:

```bash
jms create my-project 或 jms c my-project
```

生成项目

![image](https://user-images.githubusercontent.com/1990992/56626711-67314600-6675-11e9-85ac-136c50367ab3.png)

询问是否自动安装依赖（需要花费一些时间），可以自己后续再手动安装。

![image](https://user-images.githubusercontent.com/1990992/56626721-73b59e80-6675-11e9-8660-d78d97e2c709.png)

添加一个已存在的项目:

```bash
jms add D:\my-project 或 jms a D:\my-project
```

![image](https://user-images.githubusercontent.com/1990992/56626593-dfe3d280-6674-11e9-8e5c-4b7d081d37c0.png)

项目管理控制面板:

```bash
jms console 或 jms cb
```

![image](https://user-images.githubusercontent.com/1990992/56626812-d9098f80-6675-11e9-9dd2-2cf917680ca5.png)

<table>
  <tr>
    <td valign="top"><img src="https://user-images.githubusercontent.com/1990992/56567809-48d13900-65e8-11e9-8896-d28d23f30e37.png" /></td>
    <td valign="top"><img src="https://user-images.githubusercontent.com/1990992/56567831-52f33780-65e8-11e9-9fa6-7093d400ffa9.png" /></td>
    <td valign="top"><img src="https://user-images.githubusercontent.com/1990992/56567860-5dadcc80-65e8-11e9-93e5-bfc5beb249cb.png" /></td>
  </tr>
</table>

列出本机所有的项目:

```bash
jms list 或 jms ls
```

![image](https://user-images.githubusercontent.com/1990992/56626855-ff2f2f80-6675-11e9-9542-5f2cec0a029b.png)

移除项目（仅移除项目记录，不删硬盘上的文件）:

```bash
jms remove 或 jms rm
```
选择项目序号，进行移除

![image](https://user-images.githubusercontent.com/1990992/56627080-f0954800-6676-11e9-961f-f1d4f5e7d2d5.png)

移除成功

![image](https://user-images.githubusercontent.com/1990992/56627177-49fd7700-6677-11e9-93d4-41c7da7570a5.png)

更新项目基本信息:

```bash
jms refresh 或 jms re
```

![image](https://user-images.githubusercontent.com/1990992/56627221-7618f800-6677-11e9-9c57-2caeac0b8cf6.png)

更换 npm 源:

```bash
jms source 或 jms s
```
[【望周知】淘宝 NPM 镜像站喊你切换新域名啦](https://zhuanlan.zhihu.com/p/430580607)

老 registry.npm.taobao.org 域名 换成 registry.npmmirror.com

选择源序号，进行切换

![image](https://user-images.githubusercontent.com/1990992/56627284-b7110c80-6677-11e9-83f3-c1c52b6b6dfe.png)

切换成功

![image](https://user-images.githubusercontent.com/1990992/56627310-d314ae00-6677-11e9-8659-3bf004210cb2.png)
