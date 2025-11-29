import { config } from "./config";

export class SettingOptions {
    size: number = config.DEFAULT_SIZE;
    radius: number = config.DEFAULT_RADIUS;
    gap: number = config.DEFAULT_GAP;
    shadow: boolean = config.DEFAULT_SHADOW;
    border: boolean = config.DEFAULT_BORDER;

    /**
     * 将 SettingOptions 转为配置行字符串，供 parseStyleOptions 使用。
     */
    buildStyleLineConfig(): string {
        const parts: string[] = [];
        parts.push(`size=${this.size}`);
        parts.push(`gap=${this.gap}`);
        parts.push(`radius=${this.radius}`);
        parts.push(`shadow=${this.shadow}`);
        parts.push(`border=${this.border}`);
        return parts.join("&");
    }
}

export interface SettingPanelDom {
    panel: HTMLDivElement;
    borderCheckbox: HTMLInputElement | null;
    shadowCheckbox: HTMLInputElement | null;
    sizeRadios: HTMLInputElement[];
}