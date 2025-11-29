export class SettingOptions {
    size: number = 220;
    radius: number = 10;
    gap: number = 10;
    shadow: boolean = false;
    border: boolean = false
}

export interface SettingPanelDom {
    panel: HTMLDivElement;
    borderCheckbox: HTMLInputElement | null;
    shadowCheckbox: HTMLInputElement | null;
    sizeRadios: HTMLInputElement[];
}