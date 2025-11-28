import ImgRowPlugin from "main";
import { createErrorDiv } from "src/utils";
import { SettingOptions as SettingOptions } from "./domain";
import { MarkdownView, MarkdownPostProcessorContext, TFile } from "obsidian";

export function addImageLayoutMarkdownProcessor(plugin: ImgRowPlugin) {
    plugin.registerMarkdownCodeBlockProcessor("imgs", (source, el, ctx) => {
        const option = parseStyleOptions(source);
        const container = createContainer(option, plugin, ctx as MarkdownPostProcessorContext, el);

        const lines = source.split("\n");
        const srcList: string[] = [];
        for (const line of lines) {
            const match = /!\[.*?\]\((.*?)\)/.exec(line.trim());
            if (match) {
                const linkPath = match[1];
                const decodedPath = decodeURIComponent(linkPath);
                let file = plugin.app.metadataCache.getFirstLinkpathDest(decodedPath, ctx.sourcePath)
                    ?? plugin.app.vault.getFiles().find((f: any) => f.path.endsWith(decodedPath));
                if (file) {
                    const src = plugin.app.vault.getResourcePath(file);
                    srcList.push(src);
                } else {
                    container.appendChild(createErrorDiv(option));
                }
            }
        }
        srcList.forEach((src, idx) => {
            container.appendChild(createImage(option, src, srcList, idx));
        });

        // 将当前配置应用到容器中的所有图片（支持后续面板动态更新）
        applySettingsToContainer(container, option);

        el.appendChild(container);
    });
}

function createImage(option: SettingOptions, src: string, srcList?: string[], idx?: number): HTMLImageElement {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("plugin-image");
    img.style.setProperty("--plugin-image-size", `${option.size}px`);
    img.style.setProperty("--plugin-image-radius", `${option.radius}px`);
    if (option.shadow) img.classList.add("plugin-image-shadow")
    if (option.border) img.classList.add("plugin-image-border");

    img.addEventListener("click", () => {
        let curIdx = idx || 0;
        const overlay = document.createElement("div");
        overlay.classList.add("plugin-image-overlay");

        const largeImg = document.createElement("img");
        largeImg.src = srcList?.[curIdx] || src;
        largeImg.classList.add("plugin-image-large");
        if (option.border) largeImg.classList.add("plugin-image-border-large");

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "←";
        prevBtn.className = "plugin-image-nav-btn plugin-image-nav-btn-prev";
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "→";
        nextBtn.className = "plugin-image-nav-btn plugin-image-nav-btn-next";

        let scale = 1;
        const minScale = 1.0;
        const maxScale = 2.5;
        largeImg.style.transition = "transform 0.2s";
        largeImg.addEventListener("wheel", e => {
            e.preventDefault();
            const delta = e.deltaY;
            if (delta < 0) {
                scale = Math.min(maxScale, scale + 0.1);
            } else {
                scale = Math.max(minScale, scale - 0.1);
            }
            largeImg.style.transform = `scale(${scale})`;
        });
        // 切换图片函数
        const switchTo = (newIdx: number) => {
            if (!srcList) return;
            curIdx = newIdx;
            largeImg.src = srcList[curIdx];
            scale = 1;
            largeImg.style.transform = "scale(1)";
            updateBtnState();
        };
        prevBtn.onclick = () => {
            if (srcList && curIdx > 0) switchTo(curIdx - 1);
        };
        nextBtn.onclick = () => {
            if (srcList && curIdx < srcList.length - 1) switchTo(curIdx + 1);
        };
        function updateBtnState() {
            if (!srcList) return;
            prevBtn.disabled = curIdx === 0;
            nextBtn.disabled = curIdx === srcList.length - 1;
        }
        if (srcList && srcList.length > 1) {
            overlay.appendChild(prevBtn);
            overlay.appendChild(nextBtn);
        }
        updateBtnState();

        overlay.appendChild(largeImg);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add("plugin-image-overlay-visible");
        });
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closePreview();
        });
        // 支持左右方向键切换
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closePreview();
            if (srcList && srcList.length > 1 && overlay.parentNode) {
                if (event.key === "ArrowLeft" && curIdx > 0) {
                    switchTo(curIdx - 1);
                }
                if (event.key === "ArrowRight" && curIdx < srcList.length - 1) {
                    switchTo(curIdx + 1);
                }
            }
        };
        document.addEventListener("keydown", handleKeydown);
        function closePreview() {
            overlay.classList.remove("plugin-image-overlay-visible");
            setTimeout(() => { overlay.remove() }, 300);
            document.removeEventListener("keydown", handleKeydown);
        }
    });
    return img;
}

/**
 * 创建图片容器及右上角的设置面板。
 * 面板中的控件会和传入的 SettingOptions 进行绑定，并在修改时写回到 Markdown 源码。
 */
function createContainer(
    option: SettingOptions,
    plugin: ImgRowPlugin,
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("plugin-image-container");
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);

    // setting按钮（仅在阅读模式下可见）
    const settingBtn = document.createElement("button");
    settingBtn.className = "plugin-image-setting-btn-container";
    settingBtn.innerHTML = `<div class="plugin-image-setting-btn icon--settings">`;
    settingBtn.style.display = "none";
    container.appendChild(settingBtn);

    // 为每个容器生成独立的 radio 分组名，避免多个代码块之间互相影响
    const sizeGroupName = `imgs-size-${Math.random().toString(36).slice(2, 8)}`;

    // setting面板
    const panel = document.createElement("div");
    panel.className = "plugin-image-setting-panel";
    panel.style.display = "none";
    panel.innerHTML = `
      <label class="plugin-image-setting-checkbox">
        <input type="checkbox" data-setting="border"/> border
      </label>
      <label class="plugin-image-setting-checkbox">
        <input type="checkbox" data-setting="shadow"/> shadow
      </label>
      <div class="plugin-image-setting-size-group">
        <label class="plugin-image-setting-size-radio">
          <input type="radio" data-size="small" name="${sizeGroupName}" /> S
        </label>
        <label class="plugin-image-setting-size-radio">
          <input type="radio" data-size="medium" name="${sizeGroupName}" /> M
        </label>
        <label class="plugin-image-setting-size-radio">
          <input type="radio" data-size="large" name="${sizeGroupName}" /> L
        </label>
      </div>
    `;
    container.appendChild(panel);

    // 根据当前的配置初始化面板勾选状态
    const borderCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="border"]');
    const shadowCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="shadow"]');
    if (borderCheckbox) borderCheckbox.checked = option.border;
    if (shadowCheckbox) shadowCheckbox.checked = option.shadow;

    const sizeRadios = Array.from(
        panel.querySelectorAll<HTMLInputElement>('input[type="radio"][name="' + sizeGroupName + '"]')
    );
    // 根据当前 size 推断 S / M / L
    const currentSize = option.size;
    const pickSizeLabel = currentSize <= 90 ? "small" : currentSize <= 150 ? "medium" : "large";
    sizeRadios.forEach((radio) => {
        if (radio.dataset.size === pickSizeLabel) {
            radio.checked = true;
        }
    });

    // 绑定事件：勾选框/单选按钮改变时，实时更新配置并作用到当前容器
    borderCheckbox?.addEventListener("change", () => {
        option.border = !!borderCheckbox.checked;
        applySettingsToContainer(container, option);
        persistOptionsToSource(option, plugin, ctx, el);
    });
    shadowCheckbox?.addEventListener("change", () => {
        option.shadow = !!shadowCheckbox.checked;
        applySettingsToContainer(container, option);
        persistOptionsToSource(option, plugin, ctx, el);
    });
    sizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (!radio.checked) return;
            // 给 S / M / L 映射一个具体像素值
            switch (radio.dataset.size) {
                case "small":
                    option.size = 90;
                    option.gap = 5;
                    break;
                case "medium":
                    option.size = 150;
                    option.gap = 8;
                    break;
                case "large":
                    option.size = 220;
                    option.gap = 10;
                    break;
            }
            applySettingsToContainer(container, option);
            persistOptionsToSource(option, plugin, ctx, el);
        });
    });

    // 仅在阅读模式下启用面板入口
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    const mode =
        (view as any)?.getMode?.() ??
        (view as any)?.currentMode?.type ??
        "preview";
    const isPreviewMode = mode === "preview";

    if (isPreviewMode) {
        // setting按钮点击显示/隐藏面板
        settingBtn.onclick = (e) => {
            e.stopPropagation();
            panel.style.display = panel.style.display === "none" ? "block" : "none";
        };

        // 点击面板外自动关闭
        document.addEventListener("click", (e: any) => {
            if (!container.contains(e.target)) {
                panel.style.display = "none";
            }
        });

        container.addEventListener("mouseenter", () => {
            settingBtn.style.display = "flex";
        });
        container.addEventListener("mouseleave", () => {
            settingBtn.style.display = "none";
            panel.style.display = "none";
        });
    }

    return container;
}

/**
 * 将 SettingOptions 应用到某个容器中的所有图片与容器本身。
 * 这样 parseStyleOptions + 设置面板 就形成了统一的数据源。
 */
function applySettingsToContainer(container: HTMLDivElement, option: SettingOptions) {
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);

    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>(".plugin-image"));
    imgs.forEach((img) => {
        // 尺寸 & 圆角
        img.style.setProperty("--plugin-image-size", `${option.size}px`);
        img.style.setProperty("--plugin-image-radius", `${option.radius}px`);

        // 阴影
        if (option.shadow) {
            img.classList.add("plugin-image-shadow");
        } else {
            img.classList.remove("plugin-image-shadow");
        }

        // 边框
        if (option.border) {
            img.classList.add("plugin-image-border");
        } else {
            img.classList.remove("plugin-image-border");
        }
    });
}

/**
 * 将当前 option 写回到对应 Markdown 文档的代码块中（更新/插入配置行）。
 *
 * 约定格式：
 *   size=220&gap=10&radius=10&shadow=false&border=false---
 *   ![img](...)
 *
 * 注意：
 * - 之前用 editor.replaceRange 在某些情况下（多窗口 / 预览模式等）会出现「逻辑上写入成功但在 Obsidian 里看不到」的问题。
 * - 这里改为直接基于 Vault 文件内容进行修改，再整体写回，保证预览和编辑视图都能正确刷新。
 */
async function persistOptionsToSource(
    option: SettingOptions,
    plugin: ImgRowPlugin,
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
) {
    const section = ctx.getSectionInfo(el);
    if (!section) return;

    // 通过 ctx.sourcePath 拿到真正的文件，而不是依赖当前激活视图
    const file = plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile)) return;

    // 读取整篇文档文本
    const content = await plugin.app.vault.read(file);
    const lines = content.split("\n");

    // 代码块内部内容所在的行范围：
    // section.lineStart    -> ```imgs 这一行
    // section.lineStart+1  -> 代码块内部第一行
    // section.lineEnd      -> ``` 这一行
    const innerStart = section.lineStart + 1;
    const innerEnd = section.lineEnd;

    if (innerStart >= innerEnd || innerStart < 0 || innerEnd > lines.length) {
        return;
    }

    const currentInner = lines.slice(innerStart, innerEnd).join("\n");
    const newInner = buildInnerSourceFromOptions(option, currentInner);
    if (newInner === currentInner) return;

    // buildInnerSourceFromOptions 可能会在末尾带一个换行，这里统一拆成行数组
    const newInnerLines = newInner.endsWith("\n")
        ? newInner.slice(0, -1).split("\n")
        : newInner.split("\n");

    const newLines = [
        ...lines.slice(0, innerStart),
        ...newInnerLines,
        ...lines.slice(innerEnd),
    ];

    await plugin.app.vault.modify(file, newLines.join("\n"));
}

/**
 * 根据当前配置构造（或更新）代码块内部的文本内容。
 * 会保留原有的图片 Markdown，只替换/添加配置行。
 */
function buildInnerSourceFromOptions(option: SettingOptions, currentInner: string): string {
    const styleLine = buildStyleLineFromOptions(option);

    if (!currentInner.includes("---")) {
        // 原来没有任何配置，直接在最前面插入一行配置
        const trimmed = currentInner.replace(/^\s*/, "");
        return `${styleLine}---\n${trimmed}`;
    }

    const idx = currentInner.indexOf("---");
    const after = currentInner.slice(idx + 3); // 去掉 '---'
    // 去掉 '---' 后面紧跟的空白和换行，保留图片等内容
    const imagesPart = after.replace(/^[ \t\r\n]*/, "");

    return `${styleLine}---\n${imagesPart}`;
}

/**
 * 将 SettingOptions 转为配置行字符串，供 parseStyleOptions 使用。
 */
function buildStyleLineFromOptions(option: SettingOptions): string {
    const parts: string[] = [];
    parts.push(`size=${option.size}`);
    parts.push(`gap=${option.gap}`);
    parts.push(`radius=${option.radius}`);
    parts.push(`shadow=${option.shadow}`);
    parts.push(`border=${option.border}`);
    return parts.join("&");
}

function parseStyleOptions(source: string): SettingOptions {
    const settings = new SettingOptions();
    if (!source.includes("---")) return settings;

    const parts = source.split("---").map(part => part.trim());
    const styleLines = parts[0].split("&");

    for (const line of styleLines) {
        const [key, value] = line.split("=").map(s => s.trim());
        if (!key || value === undefined) continue;

        switch (key) {
            case "size":
                const size = parseInt(value);
                if (!isNaN(size) && size >= 50 && size <= 500) {
                    settings.size = size;
                }
                break;
            case "gap":
                const gap = parseInt(value);
                if (!isNaN(gap) && gap >= 0 && gap <= 50) {
                    settings.gap = gap;
                }
                break;
            case "radius":
                const radius = parseInt(value);
                if (!isNaN(radius) && radius >= 0 && radius <= 50) {
                    settings.radius = radius;
                }
                break;
            case "shadow":
                settings.shadow = value.toLowerCase() === "true";
                break;
            case "border":
                settings.border = value.toLowerCase() === "true";
                break;
        }
    }
    return settings;
}

