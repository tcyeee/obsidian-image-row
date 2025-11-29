import { SettingOptions, SettingPanelDom } from "./domain";

/**
 * 创建图片容器元素，设置基础类名和间距变量。
 */
export function createImageContainerElement(option: SettingOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("plugin-image-container");
    container.style.setProperty("--plugin-container-gap", `${option.gap}px`);
    return container;
}

/**
 * 创建右上角的 setting 按钮（仅图标，无事件绑定）。
 */
export function createSettingButtonElement(): HTMLButtonElement {
    const settingBtn = document.createElement("button");
    settingBtn.type = "button";
    settingBtn.className = "plugin-image-setting-btn-container";

    const settingIcon = document.createElement("div");
    settingIcon.className = "plugin-image-setting-btn icon--settings";

    settingBtn.appendChild(settingIcon);

    return settingBtn;
}

/**
 * 创建 setting 面板的 DOM 结构（尺寸单选 + 边框 / 阴影勾选）。
 * 只负责元素创建与基础属性，勾选状态与事件绑定由调用方处理。
 */
export function createSettingPanelDom(sizeGroupName: string): SettingPanelDom {
    // 尺寸选项分组（滑块样式的按钮组）
    const sizeGroup = document.createElement("div");
    sizeGroup.className = "plugin-image-setting-size-group";
    // 默认选中中号，用于初始化滑块位置；实际选中值会在外部根据 SettingOptions 覆盖
    sizeGroup.dataset.size = "medium";

    // 背景滑块条
    const slider = document.createElement("div");
    slider.className = "plugin-image-setting-size-slider";
    sizeGroup.appendChild(slider);

    // 尺寸选项单选（内部仍然使用 radio，外观是按钮组）
    const createSizeRadio = (sizeKey: "small" | "medium" | "large", labelText: string) => {
        const label = document.createElement("label");
        label.className = "plugin-image-setting-size-radio";

        const input = document.createElement("input");
        input.type = "radio";
        input.className = "plugin-image-setting-size-radio-input";
        input.dataset.size = sizeKey;
        input.name = sizeGroupName;

        const textSpan = document.createElement("span");
        textSpan.className = "plugin-image-setting-size-radio-text";
        textSpan.textContent = labelText;

        label.appendChild(input);
        label.appendChild(textSpan);
        return label;
    };

    sizeGroup.appendChild(createSizeRadio("small", "S"));
    sizeGroup.appendChild(createSizeRadio("medium", "M"));
    sizeGroup.appendChild(createSizeRadio("large", "L"));

    // checkbox：边框 & 阴影
    const createSettingCheckbox = (settingKey: "border" | "shadow", text: string) => {
        const label = document.createElement("label");
        label.className = "plugin-image-setting-checkbox";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.setting = settingKey;

        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${text}`));
        return label;
    };

    const panel = document.createElement("div");
    panel.className = "plugin-image-setting-panel";
    panel.appendChild(sizeGroup);
    panel.appendChild(createSettingCheckbox("border", "border"));
    panel.appendChild(createSettingCheckbox("shadow", "shadow"));

    const borderCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="border"]');
    const shadowCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="shadow"]');
    const sizeRadios = Array.from(
        panel.querySelectorAll<HTMLInputElement>('input[type="radio"][name="' + sizeGroupName + '"]'),
    );

    return { panel, borderCheckbox, shadowCheckbox, sizeRadios };
}

/**
 * 创建错误提示元素
 * 
 * @param option - 配置对象
 * @returns 错误提示元素
 */
export function createErrorDiv(option: SettingOptions): HTMLDivElement {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("plugin-image-error", "plugin-image");

    const icon = document.createElement("div");
    icon.className = "icon--error-picture";

    const text = document.createElement("span");
    text.textContent = "404";

    errorDiv.appendChild(icon);
    errorDiv.appendChild(text);
    errorDiv.style.setProperty("--plugin-image-size", `${option.size}px`);
    errorDiv.style.setProperty("--plugin-image-radius", `${option.radius}px`);
    if (option.shadow) errorDiv.classList.add("plugin-image-shadow")
    if (option.border) errorDiv.classList.add("plugin-image-border");
    return errorDiv;
}
