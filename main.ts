import { Plugin } from "obsidian";
import { addImageLayoutMarkdownProcessor } from "./src/processor";
import { addImageRenameEvent } from "src/rename";

export default class ImgRowPlugin extends Plugin {
	async onload() {
		addImageLayoutMarkdownProcessor(this)
		addImageRenameEvent(this)
	}
}