export const config = {
    DEFAULT_SIZE: 150,     // 默认图片大小
    DEFAULT_GAP: 8,        // 默认图片间距
    DEFAULT_RADIUS: 8,     // 默认图片圆角
    DEFAULT_SHADOW: true,  // 默认显示阴影
    DEFAULT_BORDER: false, // 默认不显示边框

    /* SMALL */
    SMALL_SIZE: 90,
    SMALL_GAP: 5,
    SMALL_RADIUS: 5,

    /* MEDIUM */
    MEDIUM_SIZE: 150,
    MEDIUM_GAP: 8,
    MEDIUM_RADIUS: 8,

    /* LARGE */
    LARGE_SIZE: 220,
    LARGE_GAP: 10,
    LARGE_RADIUS: 10,

    /* THUMBNAIL */
    // 注意：Obsidian 对以 "." 开头的目录（例如 ".cache"）不会作为 Vault 内容进行索引，
    // 因此缩略图目录必须使用非点开头的路径，才能通过 vault.getAbstractFileByPath 正常访问。
    THUMBNAIL_PATH: "assets/cache/",
    THUMBNAIL_QUALITY: 0.8, // 缩略图质量
    THUMBNAIL_SIZE: 220,    // 缩略图尺寸
};