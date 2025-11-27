import ImgRowPlugin from "main";
import { createErrorDiv } from "src/utils";
import { SettingOptions as SettingOptions } from "./domain";

export function addImageLayoutMarkdownProcessor(plugin: ImgRowPlugin) {
    plugin.registerMarkdownCodeBlockProcessor("imgs", (source, el, ctx) => {
        const option = parseStyleOptions(source)
        const container = createContainer(option)

        const lines = source.split("\n");
        const srcList: string[] = [];
        for (const line of lines) {
            const match = /!\[.*?\]\((.*?)\)/.exec(line.trim());
            if (match) {
                const linkPath = match[1];
                const decodedPath = decodeURIComponent(linkPath);
                let file = this.app.metadataCache.getFirstLinkpathDest(decodedPath, ctx.sourcePath)
                    ?? this.app.vault.getFiles().find((f: any) => f.path.endsWith(decodedPath));
                if (file) {
                    const src = this.app.vault.getResourcePath(file);
                    srcList.push(src);
                } else {
                    container.appendChild(createErrorDiv(option));
                }
            }
        }
        srcList.forEach((src, idx) => {
            container.appendChild(createImage(option, src, srcList, idx));
        });
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

function createContainer(option: SettingOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("plugin-image-container");
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);

    // setting按钮
    const settingBtn = document.createElement("button");
    // settingBtn.textContent = "setting";
    settingBtn.className = "plugin-image-setting-btn icon--settings";
    settingBtn.style.display = "none";
    container.appendChild(settingBtn);

    // setting面板
    const panel = document.createElement("div");
    panel.className = "plugin-image-setting-panel";
    panel.style.display = "none";
    panel.innerHTML = `
      <label class="plugin-image-setting-checkbox"><input type="checkbox"/> border</label>
      <label class="plugin-image-setting-checkbox"><input type="checkbox"/> shadow</label>
      <div class="plugin-image-setting-size-group">
        <label class="plugin-image-setting-size-radio">
          <input type="radio" name="imgs-size" /> S
        </label>
        <label class="plugin-image-setting-size-radio">
          <input type="radio" name="imgs-size" /> M
        </label>
        <label class="plugin-image-setting-size-radio">
          <input type="radio" name="imgs-size" /> L
        </label>
      </div>
    `;
    container.appendChild(panel);

    // setting按钮点击显示/隐藏面板
    settingBtn.onclick = (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === "none" ? "block" : "none";
    };

    // 点击面板外自动关闭
    document.addEventListener('click', (e: any) => {
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

    return container;
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

