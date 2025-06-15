import ImgRowPlugin from "main";

export function addImageLayoutMarkdownProcessor(plugin: ImgRowPlugin) {
    plugin.registerMarkdownCodeBlockProcessor("imgs", (source, el, ctx) => {
        // Create a container for images
        const container = document.createElement("div");
        container.textContent = "Custom 'imgs' block detected 333";
        container.style.backgroundColor = "#f0f0f0";
        container.style.padding = "10px";
        container.style.border = "1px dashed #aaa";

        el.appendChild(container);
    });
}