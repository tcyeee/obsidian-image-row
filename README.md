![](assets/banner.png)

<div align="center"><a href="i18n/README.zh.md">中文</a> ｜ English</div>

<br>
<br>
<br>


Obsidian Image Cluster helps you easily combine multiple images together in your notes, making your note interface more beautiful and organized.

![](assets/1.png)

## ✅ How to Use

1. Right‑click on an image link and choose “Wrap the images into a group”.

![](assets/2.gif)

2. In **Reading mode**, click the “Settings” button at the top‑right corner of an image group to customize its style.

![](assets/3.gif)


## ⭐ Optional Settings

The style configuration of an image group is stored in the first line of the `imgs` code block and ends with `;;`.  
You can manually tweak the parameters there for deeper customization.

````text
```imgs
size=150&gap=8&radius=10&shadow=false&border=false;;
![](assets/1.png)
![](assets/2.png)
![](assets/3.png)
![](assets/4.png)
```
````

### Optional parameters

| Option | Description                    | Default | Available options |
| ------ | ------------------------------ | ------- | ----------------- |
| size   | Image width and height in `px` | 220     | 50~500            |
| radius | Border radius in `px`          | 10      | 0~50              |
| gap    | Space between images in `px`   | 10      | 0~50              |
| shadow | Show drop shadow or not        | false   | false / true      |
| border | Show border around images      | false   | false / true      |

