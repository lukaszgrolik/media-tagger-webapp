import { UpdateFilesBody } from "../store/api/api-files";
import { Store } from "../store/store";

export class GlobalUtils {
    activeProjectName: string = '';

    constructor(readonly store: Store) {

    }

    getSelectedFiles(): string[] {
        return this.store.activeTab.selectedFilePaths.map(fp => fp.path);
    }

    async createTags(tags: (string | {name: string; parentId?: number})[]) {
        const bodyTags = tags.map(tag => {
            if (typeof tag === 'string') return {name: tag};

            return tag;
        });

        await this.store.api.tags.createTags(this.activeProjectName, {tags: bodyTags});
    }

    // async updateTags() {

    // }

    async deleteTags(ids: number[]) {
        await this.store.api.tags.deleteTags(this.activeProjectName, ids);
    }

    async updateFiles(body: UpdateFilesBody) {
        await this.store.api.files.updateFiles(this.activeProjectName, body);
    }

    async addSelectedFilesTags(tagsIds: number[]) {
        const selFilePaths = this.getSelectedFiles();
        if (selFilePaths.length === 0) {
            console.warn('no files selected');
            return;
        }

        await this.store.api.files.updateFilesTags(this.activeProjectName, {
            filePaths: selFilePaths,
            addedTagsIds: tagsIds,
        });
    }

    async removeSelectedFilesTags(tagsIds: number[]) {
        const selFilePaths = this.getSelectedFiles();
        if (selFilePaths.length === 0) {
            console.warn('no files selected');
            return;
        }

        await this.store.api.files.updateFilesTags(this.activeProjectName, {
            filePaths: selFilePaths,
            removedTagsIds: tagsIds,
        });
    }

    // async deleteFiles(ids: number[]) {

    // }
}