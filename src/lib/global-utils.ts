import { UpdateFilesBody } from "../store/api/api-files";
import { Store, FilePath } from "../store/store";
import { ArrayMap } from "./array-map";
import { humanFileSize } from "./utils";

export class GlobalUtils {
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

        await this.store.api.tags.createTags(this.store.activeProjectName, {tags: bodyTags});
    }

    // async updateTags() {

    // }

    async deleteTags(ids: number[]) {
        await this.store.api.tags.deleteTags(this.store.activeProjectName, ids);
    }

    async updateFiles(body: UpdateFilesBody) {
        await this.store.api.files.updateFiles(this.store.activeProjectName, body);
    }

    async addSelectedFilesTags(tagsIds: number[]) {
        const selFilePaths = this.getSelectedFiles();
        if (selFilePaths.length === 0) {
            console.warn('no files selected');
            return;
        }

        await this.store.api.files.updateFilesTags(this.store.activeProjectName, {
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

        await this.store.api.files.updateFilesTags(this.store.activeProjectName, {
            filePaths: selFilePaths,
            removedTagsIds: tagsIds,
        });
    }

    // async deleteFiles(ids: number[]) {

    // }

    async generateFilesPosters(filePaths: string[]) {
        await this.store.api.files.generateFilesPosters(this.store.activeProjectName, {
            filePaths
        });

        const fetchStatus = async () => {
            return this.store.api.files.fetchFilesPostersStatus(this.store.activeProjectName);
        };
        const loop = () => {
            setTimeout(async () => {
                const status = await fetchStatus();

                if (status.jobs.length === 0) {
                    console.log('all jobs finished');
                }
                else {
                    const jobsProgressText = status.jobs.map(job => `job #${job.id} progress: ${Math.round(job.progress.progress * 100)}%`).join(' | ');
                    console.log(new Date().toISOString(), jobsProgressText);

                    loop();
                }
            }, 1000);
        };

        loop();
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

    getFilesWithoutMetaStat() {
        return this.store.filePaths.filter(fp => {
            return !fp.file || !fp.file.meta.mtime || !fp.file.meta.fileSize;
        });
    }

    async fetchMetaStatForFilesWithoutMetaStat(max: number) {
        const files = this.getFilesWithoutMetaStat();
        const filePaths = files.map(fp => fp.path).slice(0, max);

        await this.store.api.files.fetchFilesMetaStat(this.store.activeProjectName, {
            filePaths
        });

        console.log('done');
    }

    getPossibleDuplicates() {
        const processedFileNames = new ArrayMap<string, FilePath>();
        // const processedFilePaths = new Map<FilePath, string>();
        const duplicatedFileNames: string[] = [];

        for (const fp of this.store.filePaths) {
            const fileName = fp.fileName.toLowerCase().replace(/[-_]/, ' ');

            const count = processedFileNames.addItem(fileName, fp);

            if (count > 1 && duplicatedFileNames.includes(fileName) === false) {
                duplicatedFileNames.push(fileName);
            }
        }

        return processedFileNames.filterByKeys(duplicatedFileNames);
    }

    getEstimatedSizeSavedFromRemovingDuplicates() {
        const duplicates = this.getPossibleDuplicates();
        const byExtension: {[key: string]: number} = {};
        let total = 0;

        for (const [fileName, fp] of duplicates) {
            const filesToDelete = fp.slice(1);

            for (const filePath of filesToDelete) {
                if (!byExtension[filePath.fileExt]) byExtension[filePath.fileExt] = 0;

                const size = filePath.file?.meta.fileSize || 0;
                byExtension[filePath.fileExt] += size;
                total += size;
            }
        }

        const byExtensionStr: {[key: string]: string} = {};
        for (const ext in byExtension) {
            const size = byExtension[ext];
            byExtensionStr[ext] = humanFileSize(size);
        }

        return { total: humanFileSize(total), byExtension: byExtensionStr };
    }
}

