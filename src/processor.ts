import ImgRowPlugin from "main";
import { createErrorDiv } from "src/utils";
import { SettingOptions as SettingOptions } from "./domain";

export function addImageLayoutMarkdownProcessor(plugin: ImgRowPlugin) {

    plugin.registerMarkdownCodeBlockProcessor("imgs", (source, el, ctx) => {
        const option = parseStyleOptions(source)
        const container = createContainer(option)

        const lines = source.split("\n");
        for (const line of lines) {
            const match = /!\[.*?\]\((.*?)\)/.exec(line.trim());
            if (match) {
                const linkPath = match[1];
                const decodedPath = decodeURIComponent(linkPath);
                let file = this.app.metadataCache.getFirstLinkpathDest(decodedPath, ctx.sourcePath)
                    ?? this.app.vault.getFiles().find((f: any) => f.path.endsWith(decodedPath));
                if (file) {
                    const src = this.app.vault.getResourcePath(file);
                    container.appendChild(createImage(option, src));
                } else {
                    container.appendChild(createErrorDiv(option));
                }
            }
        }
        el.appendChild(container);
    });
}

function createImage(option: SettingOptions, src: string): HTMLImageElement {
    const img = document.createElement("img");
    img.src = src;
    img.style.height = option.size + "px";
    img.style.width = option.size + "px";
    img.style.borderRadius = option.radius + "px";
    img.style.objectFit = "cover";
    img.style.display = "block";
    if (option.shadow) {
        img.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    }
    if (option.border) {
        img.style.border = "1px solid #ccc";
    }

    img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        // 初始透明度为 0
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.3s ease";

        const largeImg = document.createElement("img");
        largeImg.src = src;
        largeImg.style.maxWidth = "90%";
        largeImg.style.maxHeight = "90%";
        largeImg.style.borderRadius = option.radius + "px";
        largeImg.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
        largeImg.style.border = option.border ? "1px solid #ccc" : "none";

        overlay.appendChild(largeImg);
        document.body.appendChild(overlay);

        // 🚀 淡入动画
        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
        });

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closePreview();
            }
        });

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePreview();
            }
        };
        document.addEventListener("keydown", handleKeydown);

        // ✅ 关闭并淡出
        function closePreview() {
            overlay.style.opacity = "0";
            // 等待动画结束后再移除元素
            setTimeout(() => {
                overlay.remove();
            }, 300);
            document.removeEventListener("keydown", handleKeydown);
        }
    });

    return img;
}

function createContainer(option: SettingOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.padding = "8px 0";
    container.style.gap = option.gap + "px";
    return container
}

function parseStyleOptions(source: string): SettingOptions {
    const settings = new SettingOptions();
    if (!source.includes("---")) return settings;

    const parts = source.split("---").map(part => part.trim());
    const styleLines = parts[0].split("\n");

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

