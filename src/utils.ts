import { SettingOptions } from "./domain";

/* create error notice */
export function createErrorDiv(option: SettingOptions): HTMLDivElement {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("plugin-image-error");

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "20");
  icon.setAttribute("height", "20");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.innerHTML = `
      <rect width="24" height="24" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 2l20 20M10.41 10.41a2 2 0 1 1-2.83-2.83m5.92 5.92L6 21m12-9l3 3"/><path d="M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59M21 15V5a2 2 0 0 0-2-2H9"/></g>
    `;

  const text = document.createElement("span");
  text.textContent = "404";

  errorDiv.appendChild(icon);
  errorDiv.appendChild(text);
  return errorDiv;
}

/**
 * 将单行图片语法包装成 ```imgs 代码块。
 *
 * 输入示例：
 *   "![|406x259](/assets/20251128083922.png)"
 *
 * 返回示例（字符串中真实包含换行符，而不是缩进）：
 *   ```imgs
 *   ![|406x259](/assets/20251128083922.png)
 *   ```
 */
export function imgsWrapper(imageSyntax: string): string {
  const trimmed = imageSyntax.trim();
  return "```imgs\n" + trimmed + "\n```";
}

/**
 * 提取当前行中的全部图片语法文本：
 * - 普通 Markdown： ![alt](path)
 * - 内部资源： ![[file.png]]
 */
export function getImageSyntaxes(line: string): string {
  const imageSyntaxes: string[] = [];
  const imageRegex = /!\[.*?\]\((.*?)\)|!\[\[.*?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = imageRegex.exec(line)) !== null) {
    imageSyntaxes.push(match[0]);
  }
  return imageSyntaxes.length > 0 ? imageSyntaxes.join("\n") : line;;
}

/**
 * 简单识别当前行是否包含图片语法：
 * - 普通 Markdown： ![alt](path)
 * - 内部资源： ![[file.png]]
 * @param line - 当前行文本
 * @returns 如果包含，则返回 true，否则返回 false。
 */
export function hasMarkdownImage(line: string): boolean {
  return /!\[.*?\]\((.*?)\)/.test(line) || /!\[\[.*?\]\]/.test(line);
}

/**
 * 统一修改元素的内联样式属性，方便以后替换为 CSS 变量或其他方案。
 */
export function setCssProps(el: HTMLElement, props: Record<string, string>): void {
  Object.entries(props).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}