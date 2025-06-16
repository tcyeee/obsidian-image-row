import ImgRowPlugin from "main";

export function addImageRenameEvent(plugin: ImgRowPlugin) {
    plugin.registerEvent(
        this.app.vault.on("rename", async (file: any, oldPath: any) => {
            if (!file.path.match(/\.(png|jpe?g|gif|bmp|svg)$/i)) return;

            const markdownFiles = this.app.vault.getMarkdownFiles();
            for (const mdFile of markdownFiles) {
                const content = await this.app.vault.read(mdFile);

                const newContent = content.replace(/```imgs([\s\S]*?)```/g, (block: any) => {
                    if (block.includes(oldPath)) {
                        const updated = block.replaceAll(oldPath, file.path);
                        console.log(`[Image Row Plugin] Updated path in ${mdFile.path}`);
                        return updated;
                    }
                    return block;
                });

                if (newContent !== content) await this.app.vault.modify(mdFile, newContent);
            }
        })
    );
}