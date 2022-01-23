import { UpdateFilesBody } from "../store/api/api-files";
import { Store } from "../store/store";

export class GlobalUtils {
    activeProjectName: string = '';

    constructor(readonly store: Store) {

    }

    getSelectedFiles(): string[] {
        if (!this.store.activeTab) return [];

        return this.store.activeTab.selectedFilePaths.map(fp => fp.path);
    }

    resetFilters() {
        this.store.activeTab?.filtering.reset();
    }

    filterByFileType(fileType: 'image' | 'video' | null) {
        this.store.activeTab?.filtering.setFileType(fileType);
    }

    untaggedFilesOnly(val = true) {
        this.store.activeTab?.filtering.setUntagged(val);
    }

    filterByTags(tagsIds: number[]) {
        this.store.activeTab?.filtering.setTags(tagsIds);
    }

    omitTags(tagsIds: number[]) {
        this.store.activeTab?.filtering.setWithoutTags(tagsIds);
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

    async generateFilesPosters(filePaths: string[]) {
        await this.store.api.files.generateFilesPosters(this.activeProjectName, {
            filePaths
        });
    }

    getVideosWithoutPosters() {
        return this.store.filePaths.filter(fp => {
            return fp.path.match(/\.mp4$/) && !fp.file?.meta?.poster;
        });
    }

    async generatePostersForVideosWithoutPosters(max: number) {
        const files = this.getVideosWithoutPosters();
        const filePaths = files.map(fp => fp.path).slice(0, max);

        await this.generateFilesPosters(filePaths);
    }
}