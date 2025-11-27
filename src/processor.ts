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
    img.classList.add("plugin-image");
    img.style.setProperty("--plugin-image-size", `${option.size}px`);
    img.style.setProperty("--plugin-image-radius", `${option.radius}px`);
    if (option.shadow) img.classList.add("plugin-image-shadow")
    if (option.border) img.classList.add("plugin-image-border");

    img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.classList.add("plugin-image-overlay");

        const largeImg = document.createElement("img");
        largeImg.src = src;
        largeImg.classList.add("plugin-image-large");
        if (option.border) largeImg.classList.add("plugin-image-border-large");

        // ========== 放大缩小逻辑 begin ==========
        let scale = 1;
        const minScale = 1.0;
        const maxScale = 2.0;
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
        // ========== 放大缩小逻辑 end ==========

        overlay.appendChild(largeImg);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add("plugin-image-overlay-visible");
        });

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closePreview();
        });

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closePreview();
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

function createContainer(option: SettingOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("plugin-image-container");
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);
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

