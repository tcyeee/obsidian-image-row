import ImgRowPlugin from "main";
import { setCssProps, parseStyleOptions } from "src/utils";
import { createImageContainerElement, createSettingButtonElement, createSettingPanelDom, createErrorDiv } from "src/ui";
import { SettingOptions as SettingOptions, SettingPanelDom } from "./domain";
import { MarkdownView, MarkdownPostProcessorContext, TFile } from "obsidian";
import { config } from "./config";

type MarkdownViewWithCurrentMode = MarkdownView & {
    currentMode?: {
        type: string;
    };
};

/**
 * 自动解析imgs代码块
 * 当解析到imgs代码块时，会自动创建一个图片容器，并应用对应的配置。
 */
export function addImageLayoutMarkdownProcessor(plugin: ImgRowPlugin) {
    plugin.registerMarkdownCodeBlockProcessor("imgs", (source, el, ctx) => {
        const option = parseStyleOptions(source);
        const container = createContainer(option, plugin, ctx, el);

        const lines = source.split("\n");
        const srcList: string[] = [];
        for (const line of lines) {
            const match = /!\[.*?\]\((.*?)\)/.exec(line.trim());
            if (match) {
                const linkPath = match[1];
                const decodedPath = decodeURIComponent(linkPath);
                let file =
                    plugin.app.metadataCache.getFirstLinkpathDest(decodedPath, ctx.sourcePath) ??
                    plugin.app.vault.getFiles().find((f: TFile) => f.path.endsWith(decodedPath));
                if (file) {
                    const src = plugin.app.vault.getResourcePath(file);
                    const imgIdx = srcList.length;
                    srcList.push(src);
                    const imgEl = createImage(option, src, srcList, imgIdx);
                    container.appendChild(imgEl);
                } else {
                    // 如果图片不存在，则在对应位置插入错误图标
                    container.appendChild(createErrorDiv(option));
                }
            }
        }
        // 将当前配置应用到容器中的所有图片（支持后续面板动态更新）
        applySettingsToContainer(container, option);

        el.appendChild(container);
    });
}

/**
 * 创建图片组中的单个图片元素，并应用对应的配置。
 * 
 * @param option - 配置对象
 * @param src - 图片源
 * @param srcList - 图片列表
 * @param idx - 图片索引
 * @returns 图片元素
 */
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
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "←";
        prevBtn.className = "plugin-image-nav-btn plugin-image-nav-btn-prev";
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "→";
        nextBtn.className = "plugin-image-nav-btn plugin-image-nav-btn-next";

        let scale = 1;
        const minScale = 1.0;
        const maxScale = 2.5;
        largeImg.addEventListener("wheel", e => {
            e.preventDefault();
            const delta = e.deltaY;
            if (delta < 0) {
                scale = Math.min(maxScale, scale + 0.1);
            } else {
                scale = Math.max(minScale, scale - 0.1);
            }
            setCssProps(largeImg, { transform: `scale(${scale})` });
        });
        // 切换图片函数
        const switchTo = (newIdx: number) => {
            if (!srcList) return;
            curIdx = newIdx;
            largeImg.src = srcList[curIdx];
            scale = 1;
            setCssProps(largeImg, { transform: "scale(1)" });
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
 * 
 * @param option - 配置对象
 * @param plugin - 插件实例
 * @param ctx - 上下文
 * @param el - 元素
 * @returns 图片容器
 */
export function createContainer(option: SettingOptions, plugin: ImgRowPlugin, ctx: MarkdownPostProcessorContext, el: HTMLElement): HTMLDivElement {
    const container = createImageContainerElement(option);

    // setting按钮（仅在阅读模式下可见）
    const settingBtn = createSettingButtonElement();
    container.appendChild(settingBtn);

    // 为每个容器生成独立的 radio 分组名，避免多个代码块之间互相影响
    const sizeGroupName = `imgs-size-${Math.random().toString(36).slice(2, 8)}`;

    // setting 面板及其交互逻辑
    const { panel, persistIfNeeded } = setupSettingPanel(option, plugin, ctx, el, container, sizeGroupName,);

    // 仅在阅读模式下启用面板入口
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    const legacyView = view as MarkdownViewWithCurrentMode | null;
    const mode = view?.getMode?.() ?? legacyView?.currentMode?.type ?? "preview";
    const isPreviewMode = mode === "preview";

    if (isPreviewMode) {
        const isPanelOpen = () => panel.classList.contains("plugin-image-setting-panel--open");
        const openPanel = () => {
            panel.classList.add("plugin-image-setting-panel--open");
        };
        const closePanel = () => {
            if (!isPanelOpen()) return;
            persistIfNeeded();
            panel.classList.remove("plugin-image-setting-panel--open");
        };

        // setting按钮点击显示/隐藏面板
        settingBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = isPanelOpen();
            if (isOpen) {
                closePanel();
            } else {
                openPanel();
            }
        };

        // 点击面板外自动关闭
        document.addEventListener("click", (e: MouseEvent) => {
            const target = e.target;
            if (!(target instanceof Node)) return;
            if (!container.contains(target)) {
                closePanel();
            }
        });

        // 鼠标移入图片容器时显示设置按钮
        container.addEventListener("mouseenter", () => {
            settingBtn.classList.add("plugin-image-setting-btn-container--visible");
        });

        // 鼠标移出图片容器时隐藏设置按钮
        container.addEventListener("mouseleave", () => {
            settingBtn.classList.remove("plugin-image-setting-btn-container--visible");
            closePanel();
        });
    }

    return container;
}

/**
 * 创建并初始化 setting 面板，包括：
 * - DOM 结构（尺寸单选 + 边框/阴影勾选）
 * - 根据当前配置设置初始勾选状态
 * - 绑定变更事件并在需要时触发持久化
 * 
 * @param option - 配置对象
 * @param plugin - 插件实例
 * @param ctx - 上下文
 * @param el - 元素
 * @param container - 图片容器
 * @param sizeGroupName - 尺寸单选组名
 * @returns 设置面板
 *   { panel: HTMLDivElement; persistIfNeeded: () => void }
 *     panel: 设置面板
 *     persistIfNeeded: 持久化函数 （在需要时将更改写回到对应 Markdown 文件）
 */
function setupSettingPanel(
    option: SettingOptions,
    plugin: ImgRowPlugin,
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
    container: HTMLDivElement,
    sizeGroupName: string,
): { panel: HTMLDivElement; persistIfNeeded: () => void } {
    const { panel, borderCheckbox, shadowCheckbox, sizeRadios }: SettingPanelDom = createSettingPanelDom(sizeGroupName);

    container.appendChild(panel);

    // 根据当前的配置初始化面板勾选状态
    if (borderCheckbox) borderCheckbox.checked = option.border;
    if (shadowCheckbox) shadowCheckbox.checked = option.shadow;
    // 根据当前 size 推断 S / M / L
    const currentSize = option.size;
    const pickSizeLabel = currentSize <= 90 ? "small" : currentSize <= 150 ? "medium" : "large";
    sizeRadios.forEach((radio) => {
        if (radio.dataset.size === pickSizeLabel) {
            radio.checked = true;
        }
    });
    const sizeGroupEl = panel.querySelector<HTMLDivElement>(".plugin-image-setting-size-group");
    if (sizeGroupEl) sizeGroupEl.dataset.size = pickSizeLabel;

    // 标记当前面板中的设置是否有尚未写回文件的更改
    let hasPendingChanges = false;

    // 在需要时将更改写回到对应 Markdown 文件
    const persistIfNeeded = () => {
        if (!hasPendingChanges) return;
        hasPendingChanges = false;
        void persistOptionsToSource(option, plugin, ctx, el);
    };

    // 绑定事件：勾选框/单选按钮改变时，实时更新配置并作用到当前容器（但先不立刻写文件）
    borderCheckbox?.addEventListener("change", () => {
        option.border = !!borderCheckbox.checked;
        applySettingsToContainer(container, option);
        hasPendingChanges = true;
    });
    shadowCheckbox?.addEventListener("change", () => {
        option.shadow = !!shadowCheckbox.checked;
        applySettingsToContainer(container, option);
        hasPendingChanges = true;
    });
    sizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (!radio.checked) return;
            // 给 S / M / L 映射一个具体像素值
            const sizeLabel = radio.dataset.size;
            const sizeGroup = panel.querySelector<HTMLDivElement>(".plugin-image-setting-size-group");
            if (sizeGroup && sizeLabel) {
                sizeGroup.dataset.size = sizeLabel;
            }
            switch (sizeLabel) {
                case "small":
                    option.size = config.SMALL_SIZE;
                    option.gap = config.SMALL_GAP;
                    option.radius = config.SMALL_RADIUS;
                    break;
                case "medium":
                    option.size = config.MEDIUM_SIZE;
                    option.gap = config.MEDIUM_GAP;
                    option.radius = config.MEDIUM_RADIUS;
                    break;
                case "large":
                    option.size = config.LARGE_SIZE;
                    option.gap = config.LARGE_GAP;
                    option.radius = config.LARGE_RADIUS;
                    break;
            }
            applySettingsToContainer(container, option);
            hasPendingChanges = true;
        });
    });

    return { panel, persistIfNeeded };
}

/**
 * 将 SettingOptions 应用到某个容器中的所有图片与容器本身。
 * 这样 parseStyleOptions + 设置面板 就形成了统一的数据源。
 * 
 * @param container - 图片容器
 * @param option - 配置对象
 */
function applySettingsToContainer(container: HTMLDivElement, option: SettingOptions) {
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);

    // 这里只处理图片组中的缩略图，不包含大图预览；大图预览始终保持原图样式
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
 *   size=220&gap=10&radius=10&shadow=false&border=false;;
 *   ![img](...)
 *
 * 注意：
 * - 之前用 editor.replaceRange 在某些情况下（多窗口 / 预览模式等）会出现「逻辑上写入成功但在 Obsidian 里看不到」的问题。
 * - 这里改为直接基于 Vault 文件内容进行修改，再整体写回，保证预览和编辑视图都能正确刷新。
 * 
 * @param option - 配置对象
 * @param plugin - 插件实例
 * @param ctx - 上下文
 * @param el - 元素
 * @returns 持久化函数
 */
async function persistOptionsToSource(option: SettingOptions, plugin: ImgRowPlugin, ctx: MarkdownPostProcessorContext, el: HTMLElement): Promise<void> {
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

    if (innerStart >= innerEnd || innerStart < 0 || innerEnd > lines.length) return;

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
 * 
 * @param option - 配置对象
 * @param currentInner - 代码块内部内容
 * @returns 构造后的代码块内部内容
 */
function buildInnerSourceFromOptions(option: SettingOptions, currentInner: string): string {
    const styleLine = option.buildStyleLineConfig();
    const endSign = ";;";

    // 原来没有任何配置，直接在最前面插入一行配置
    if (!currentInner.includes(endSign)) {
        const trimmed = currentInner.replace(/^\s*/, "");
        return `${styleLine}${endSign}\n${trimmed}`;
    }

    // 原来有配置，则删掉原有配置，写入新的配置
    const idx = currentInner.indexOf(endSign);
    if (idx === -1) {
        // 理论上不会走到这里，兜底按「无配置」处理
        const trimmed = currentInner.replace(/^\s*/, "");
        return `${styleLine}${endSign}\n${trimmed}`;
    }

    // 去掉旧配置与分隔符，仅保留之后的图片等内容
    const after = currentInner.slice(idx + endSign.length);
    const imagesPart = after.replace(/^[ \t\r\n]*/, "");
    return `${styleLine}${endSign}\n${imagesPart}`;
}


