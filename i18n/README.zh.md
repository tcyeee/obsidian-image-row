![](assets/banner.png)

<div>中文｜<a>English</a></div>

Obsidian Image Cluster 可以让你在笔记中轻松将多张图片组合到一起，让你的笔记界面更美观。

![](assets/1.png)

## ✅ How to Use

1. 对图片链接右键唤出菜单，点击“Wrap the images into a group”。

![](assets/2.gif)

2. 在“阅读模式下”，点击图片组右上角“设置”按钮，进行样式自定义。

![](assets/3.gif)



## ⭐ Optional Settings

图片组的样式信息保存在`imgs`代码块第一行，以`;;`结尾，你手动修改其中参数，进行更深度的自定义。

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
| size   | Image width and height in `px` | 220     | 50~500            |
| radius | Border radius in `px`          | 10      | 0~50              |
| gap    | Space between images in `px`   | 10      | 0~50              |
| shadow | Show drop shadow or not        | false   | false / true      |
| border | Show border around images      | false   | false / true      |
