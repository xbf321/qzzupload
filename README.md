# 把当前文件夹中的图片自动上传到 qunarzz 服务器。

## 背景

### 目前开发人员上传图片，需要经历一下几步

* 在 source Group 下新建存储图片的 project
* clone project
* 添加图片
* git add -> git commit -> git push
* 等待将近 3 分钟才会接收到图片地址

### 主要问题：

* 操作流程繁琐
* 上传其他项目的图片还是这个流程
* 收到图片 URL 的时间稍长

### 解决方案

* 把流程统一到一个命令中
* 上传图片后，直接能拿到图片地址，无需等待

## 安装

```bash
npm install -g qzzupload
```

## 使用

```bash
# 上传当前目录文件
qzzupload push .

# 上传指定目录文件
qzzupload push /a/b/c

# 上传指定文件
qzzupload push ./abc.jpg
qzzupload push abc.jpg
qzzupload push /a/b/c.jpg

# 默认只扫描根目录，如果需要递归上传，请增加 -r 参数
qzzupload push . -r
qzzupload push /a/b/c -r
```

## 上传白名单

['*.jpg', '*.png', '*.gif', '*.jpeg', '*.mp4']