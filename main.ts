import { Plugin } from "obsidian";
import { addImageLayoutMarkdownProcessor } from "./src/processor";
import { imgsWrapper } from "./src/utils";

export default class ImgRowPlugin extends Plugin {
	async onload() {
		addImageLayoutMarkdownProcessor(this);
		// 在编辑器（源模式 / 实时预览）的右键菜单中追加一项： 当光标所在行包含 Markdown 图片语法时（![](...) 或 ![[]]），认为用户右键了图片附近
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor) => {
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line) ?? "";

				// 简单识别当前行是否包含图片语法：
				// - 普通 Markdown： ![alt](path)
				// - 内部资源： ![[file.png]]
				const hasMarkdownImage =
					/!\[.*?\]\((.*?)\)/.test(line) || /!\[\[.*?\]\]/.test(line);
				if (!hasMarkdownImage) return;

				// 提取当前行中的图片语法文本，如果有多张图，则取第一处匹配
				const mdImageMatch =
					line.match(/!\[.*?\]\((.*?)\)/) || line.match(/!\[\[.*?\]\]/);
				const imageSyntax = mdImageMatch ? mdImageMatch[0] : line;

				menu.addItem((item) => {
					item
						.setTitle("测试图片右键点击")
						.onClick(() => {
							console.log(imgsWrapper(imageSyntax));
						});
				});
			}),
		);
	}
}