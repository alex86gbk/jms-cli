![image](https://user-images.githubusercontent.com/1990992/48991215-fbea5300-f16c-11e8-8f0c-63c381cd581f.png)

# jms-cli

> js-multi-seed 标准开发/管理工具

### 开始使用

安装:

```bash
npm install -g jms-cli
```

创建一个新项目:

```bash
jms create my-project 或 jms c my-project
```

添加一个已存在的项目:

```bash
jms add D:\my-project 或 jms a D:\my-project
```

项目管理控制面板:

```bash
jms console 或 jms cb
```

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/1990992/56567809-48d13900-65e8-11e9-8896-d28d23f30e37.png" /></td>
    <td><img src="https://user-images.githubusercontent.com/1990992/56567831-52f33780-65e8-11e9-9fa6-7093d400ffa9.png" /></td>
    <td><img src="https://user-images.githubusercontent.com/1990992/56567860-5dadcc80-65e8-11e9-93e5-bfc5beb249cb.png" /></td>
  </tr>
</table>

列出本机所有的项目:

```bash
jms list 或 jms ls
```

移除项目（仅移除项目记录，不删硬盘上的文件）:

```bash
jms remove 或 jms rm
```

更新项目基本信息:

```bash
jms refresh 或 jms re
```

更换 npm 源:

```bash
jms source 或 jms s
```
