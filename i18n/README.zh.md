![](../assets/banner.png)

<div align="center">中文 ｜ <a href="../README.md">English</a></div>

<br>
<br>
<br>

Image Cluster 可以让你在笔记中轻松将多张图片组合到一起，让你的笔记界面更美观、更有条理。

![](../assets/1.png)

## ⬇️ 安装

### 通过社区插件（推荐）

你可以直接在 Obsidian 的社区插件商店中安装本插件：

1. 打开 Obsidian，进入 设置 → 社区插件
2. 点击“浏览”，搜索 “Image Cluster”
3. 点击“安装”，然后启用该插件
   
你也可以在社区插件页面中直接安装：[点击安装](https://obsidian.md/plugins?id=image-cluster)。

### 手动安装

1. 前往 [GitHub Releases](https://github.com/tcyeee/obsidian-image-cluster/releases) 下载最新版本
2. 将 main.js、manifest.json 和 styles.css 解压到你的仓库 `.obsidian/plugins/image-cluster/` 目录
3. 重新加载 Obsidian，并在 设置 → 社区插件 中启用插件

## ✅ 使用方法

1. 对图片链接右键唤出菜单，点击“Wrap the images into a group”。

![](../assets/2.gif)

2. 在**阅读模式下**，点击图片组右上角“设置”按钮，进行样式自定义。

![](../assets/3.gif)



## ⚙️ 配置

图片组的样式信息保存在 `imgs` 代码块第一行，以 `;;` 结尾，你可以手动修改其中参数，进行更深度的自定义。

````text
```imgs
size=150&gap=8&radius=10&shadow=false&border=false;;
![](assets/1.png)
![](assets/2.png)
![](assets/3.png)
![](assets/4.png)
```
````

### 可选参数

| Option | Description                    | Default | Available options |
| ------ | ------------------------------ | ------- | ----------------- |
| size   | Image width and height in `px` | 150     | 50~500            |
| radius | Border radius in `px`          | 10      | 0~50              |
| gap    | Space between images in `px`   | 8       | 0~50              |
| shadow | Show drop shadow or not        | false   | false / true      |
| border | Show border around images      | false   | false / true      |
| hidden | hidden images                  | false   | false / true      |
