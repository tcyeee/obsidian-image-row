import { Plugin } from "obsidian";
import { addImageLayoutMarkdownProcessor } from "./src/processor";

export default class ImgRowPlugin extends Plugin {
	async onload() {
		addImageLayoutMarkdownProcessor(this)
	}
}