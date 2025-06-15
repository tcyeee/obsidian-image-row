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
    img.style.backgroundColor = "red"
    if (option.shadow) {
        img.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    }
    if (option.border) {
        img.style.border = "1px solid #ccc";
    }

    return img;
}

function createContainer(option: SettingOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.padding = "8px";
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

