import { SettingOptions } from "./domain";



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

/**
 * 解析代码块内部的配置行
 * @param source - 代码块内容
 * 
 * 配置行格式：
 *   size=220&gap=10&radius=10&shadow=false&border=false;;
 *   ![img](...)
 * 
 * 返回配置对象：
 *   { size: 220, gap: 10, radius: 10, shadow: false, border: false }
 */
export function parseStyleOptions(source: string): SettingOptions {
  const settings = new SettingOptions();
  if (!source.includes(";;")) return settings;

  const parts = source.split(";;").map(part => part.trim());
  const styleLines = parts[0].split("&");

  for (const line of styleLines) {
    const [key, value] = line.split("=").map(s => s.trim());
    if (!key || value === undefined) continue;

    if (["size", "gap", "radius"].includes(key)) {
      const num = Number(value);
      if (key == "size" && num >= 50 && num <= 500) settings.size = num;
      if (key == "gap" && num >= 0 && num <= 50) settings.gap = num;
      if (key == "radius" && num >= 0 && num <= 50) settings.radius = num;
    }
    if (key == "shadow") settings.shadow = value.toLowerCase() === "true";
    if (key == "border") settings.border = value.toLowerCase() === "true";
  }
  return settings;
}
