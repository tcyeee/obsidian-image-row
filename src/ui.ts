import { SettingOptions } from "./domain";

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
  settingBtn.setAttribute("aria-label", "setting");

  const settingIcon = document.createElement("div");
  settingIcon.className = "plugin-image-setting-btn icon--settings";
  settingIcon.setAttribute("aria-hidden", "true");

  settingBtn.appendChild(settingIcon);
  settingBtn.style.display = "none";

  return settingBtn;
}

export interface SettingPanelDom {
  panel: HTMLDivElement;
  borderCheckbox: HTMLInputElement | null;
  shadowCheckbox: HTMLInputElement | null;
  sizeRadios: HTMLInputElement[];
}

/**
 * 创建 setting 面板的 DOM 结构（尺寸单选 + 边框 / 阴影勾选）。
 * 只负责元素创建与基础属性，勾选状态与事件绑定由调用方处理。
 */
export function createSettingPanelDom(sizeGroupName: string): SettingPanelDom {
  const panel = document.createElement("div");
  panel.className = "plugin-image-setting-panel";
  panel.style.display = "none";

  // 尺寸选项分组
  const sizeGroup = document.createElement("div");
  sizeGroup.className = "plugin-image-setting-size-group";
  sizeGroup.setAttribute("role", "radiogroup");
  sizeGroup.setAttribute("aria-label", "图片尺寸");

  const createSizeRadio = (sizeKey: "small" | "medium" | "large", labelText: string) => {
    const label = document.createElement("label");
    label.className = "plugin-image-setting-size-radio";

    const input = document.createElement("input");
    input.type = "radio";
    input.dataset.size = sizeKey;
    input.name = sizeGroupName;
    input.setAttribute("aria-label", labelText);

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${labelText}`));
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
    input.setAttribute("aria-label", text);

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${text}`));
    return label;
  };

  const borderCheckboxLabel = createSettingCheckbox("border", "border");
  const shadowCheckboxLabel = createSettingCheckbox("shadow", "shadow");

  panel.appendChild(sizeGroup);
  panel.appendChild(borderCheckboxLabel);
  panel.appendChild(shadowCheckboxLabel);

  const borderCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="border"]');
  const shadowCheckbox = panel.querySelector<HTMLInputElement>('input[data-setting="shadow"]');
  const sizeRadios = Array.from(
    panel.querySelectorAll<HTMLInputElement>('input[type="radio"][name="' + sizeGroupName + '"]'),
  );

  return {
    panel,
    borderCheckbox,
    shadowCheckbox,
    sizeRadios,
  };
}


