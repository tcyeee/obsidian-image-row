import { SettingOptions } from "./domain";

/* create error notice */
export function createErrorDiv(option: SettingOptions): HTMLDivElement {
  const errorDiv = document.createElement("div");
  errorDiv.style.display = "flex";
  errorDiv.style.flexDirection = "column";
  errorDiv.style.justifyContent = "center";
  errorDiv.style.alignItems = "center";
  errorDiv.style.gap = "8px";
  errorDiv.style.width = option.size + "px";
  errorDiv.style.height = option.size + "px";
  errorDiv.style.padding = "12px";
  errorDiv.style.border = "1px solid #ff6b6b";
  errorDiv.style.borderRadius = "6px";
  errorDiv.style.backgroundColor = "#ffecec";
  errorDiv.style.color = "#d8000c";

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
 *
 *   ![|406x259](/assets/20251128083922.png)
 *
 *
 *   ```
 */
export function imgsWrapper(imageSyntax: string): string {
  const trimmed = imageSyntax.trim();
  // 按照需求保留空行结构：
  // 第 1 行：```imgs
  // 第 3 行：图片语法
  // 第 6 行：```
  return "```imgs\n" + trimmed + "\n```";
}