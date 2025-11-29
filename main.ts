import { Plugin } from "obsidian";
import { addImageLayoutMarkdownProcessor } from "./src/processor";
import { registerEditorMenu } from "./src/register";

export default class ImgRowPlugin extends Plugin {
	onload() {
		// 自动解析imgs代码块
		addImageLayoutMarkdownProcessor(this);
		// 注册针对图片的右键菜单
		registerEditorMenu(this);
	}
}