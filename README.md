## 3dPlatform

使用Threejs开源框架，实现WEB端三维模型的定制化展示

项目源码地址：[https://github.com/TONKIA/3dPlatform](https://github.com/TONKIA/3dPlatform)

## 项目运行

```bash
cnpm install
nodemon app
```

## 效果图

#### 登录页面

![](./picture/loginPage.png)

#### 用户主页

![](./picture/homePage.png)

#### 创建方案

![](./picture/create.png)

![](./picture/sidebar.png)

#### 方案分享

![](./picture/share.png)

#### 分享页面

![](./picture/sharePage.png)


## 接口

| URL | Method | 请求JSON参数 | 描述 | 返回 |
|-|-|-|-|-|
| / | get | 无 | 请求主页 | 返回登录主页index.html文件 |
| / | post | {account, password} | 登录验证 | 1：登录成功， 0：登录失败 |
| /home | get | 无 | 请求用户主页 | 返回用户主页home.html文件 |
| /home | post | 无 | 请求用户主页的数据 | {user, schemeList{id, name, img, share_state, share_password}, shareLink} |
| /logout | get | 无 | 用户注销 | 重定向到 / |
| /create | get | 无 | 返回一个空的方案创建页面 | 返回createScheme.html页面 |
| /create/:id | get | 无 | 返回指定id的方案修改页面 | 返回createScheme.html页面 |
| /getScheme | post | 无 | 获得一个空的方案初始data数据 | {name: '默认方案', components: [], img: null, id: null, maxHeight: 10, height: 2, maxDistance: 30, distance: 10 } |
| /getScheme/:id | post | 无 | 返回指定id的方案数据 | { name, components, img, id, maxHeight, height, maxDistance, distance} |
| /changeShareConfig | {id, share_password, share_state} | 无 | 主页修改分享数据 | {affectedRows} |
| /upload/:fileType | post | file | 接受文件上传，并且返回文件名 | {originalname, mimetype, size, destination, filename, path} |
| /files/thumbnail/:filename | get | 无 | 返回相应文件名贴图文件的缩略图 | file |
| /files/:fileType/:fileName | get | 无 | 返回相应类型文件名的文件 | file |
| /saveScheme | post | { name, components, img, id, maxHeight, height, maxDistance, distance} | 方案保存 | {affectedRows} |
| /share/:id | get | 无 | 返回分享页面 | 返回share.html页面 |
| /share/:id | post | 无 | 获取分享的状态 | 0:不共享 1:共享 2:密码共享 3:当前分享页面不存在 |
| /shareData/:id | post | {state, password} | 获取分享页面的数据 | {msg, data{name, components, img, id, maxHeight, height, maxDistance, distance}} |

## 数据库

#### user


| 列名 | 数据类型 | 长度 | 默认 | 主键 | 非空 | 自增 | 注释 |
| - | - | - | - | - | - | - | - |
| id | int | 11 |  | ✔ | ✔ | ✔ |  |
| account | varchar | 20 |  |  | ✔ |  |  |
| password | varchar | 20 |  |  | ✔ |  |  |
| name | varchar | 20 |  |  |  |  |  |


#### scheme

| 列名 | 数据类型 | 长度 | 默认 | 主键 | 非空 | 自增 | 注释 |
| - | - | - | - | - | - | - | - |
| id | int | 11 |  | ✔ | ✔ | ✔ |  |
| uid | int | 11 |  |  | ✔ |  |  |
| name | varchar | 20 |  |  |  |  |  |
| img | longtext |  |  |  |  |  |  |
| data | text |  |  |  | ✔ |  |  |
| share_state | int | 11 | 0 |  |  |  | 0：不共享/1：共享/2：密码共享 |
| share_password | varchar | 20 |  |  |  |  |  |


## 第三方开源

- Three.js [https://github.com/mrdoob/three.js](https://github.com/mrdoob/three.js)
- ZUI [https://github.com/easysoft/zui](https://github.com/easysoft/zui)

