import { action, computed, makeObservable, observable, reaction } from "mobx";

import { Store } from "../store";
import { Tag, TagID } from "../tag";

type FileType = 'image' | 'video';
type MediaType = 'static' | 'animated';

export interface FilteringBody {
    readonly fileType?: FileType | null;
    readonly mediaType?: MediaType | null;
    readonly untagged?: boolean;
    readonly tagsIds?: TagID[];
    readonly withoutTagsIds?: TagID[];
}

export class Filtering {
    fileType: FileType | null = null;
    mediaType: MediaType | null = null;
    // minDate: string | null = null;
    // maxDate: string | null = null;
    untagged = false;
    readonly tagsIds: TagID[] = [];
    readonly withoutTagsIds: TagID[] = [];
    // negateTags = false;

    constructor(readonly store: Store, body: FilteringBody = {}) {
        if (body.fileType !== undefined) this.fileType = body.fileType;
        if (body.mediaType !== undefined) this.mediaType = body.mediaType;
        if (body.untagged !== undefined) this.untagged = body.untagged;
        if (body.tagsIds !== undefined) this.tagsIds = body.tagsIds;
        if (body.withoutTagsIds !== undefined) this.withoutTagsIds = body.withoutTagsIds;

        makeObservable(this, {
            reset: action,

            fileType: observable,
            setFileType: action,

            mediaType: observable,
            setMediaType: action,

            untagged: observable,
            setUntagged: action,

            tagsIds: observable,
            tags: computed,
            addTag: action,
            removeTag: action,
            setTags: action,

            withoutTagsIds: observable,
            withoutTags: computed,
            setWithoutTags: action,

            filePaths: computed,
        });

        reaction(() => {
            return {
                fileType: this.fileType,
                mediaType: this.mediaType,
                untagged: this.untagged,
                tagsIds: this.tagsIds.slice(),
                withoutTagsIds: this.withoutTagsIds.slice(),
            }
        }, obj => {
            console.log('obj', obj)

            store.updateActiveTab({
                filtering: obj
            });
        });
    }

    reset() {
        this.fileType = null;
        this.mediaType = null;
        this.untagged = false;
        this.tagsIds.length = 0;
        this.withoutTagsIds.length = 0;
    }

    setFileType(value: FileType | null) {
        this.fileType = value;
    }

    setMediaType(value: MediaType | null) {
        this.mediaType = value;
    }

    setUntagged(val: boolean) {
        this.untagged = val;
    }

    getTagsByIds(tagsIds: number[]): Tag[] {
        return tagsIds.map(tagId => this.store.tags_indexedBy_id.get(tagId)).filter(t => t) as Tag[];
    }

    get tags(): Tag[] {
        return this.getTagsByIds(this.tagsIds);
    }

    addTag(tagId: TagID) {
        this.tagsIds.push(tagId);
    }

    removeTag(tagId: TagID) {
        const index = this.tagsIds.indexOf(tagId);

        if (index !== -1) this.tagsIds.splice(index, 1);
    }

    setTags(tagsIds: TagID[]) {
        this.tagsIds.length = 0;
        this.tagsIds.push(...tagsIds);
    }

    get withoutTags(): Tag[] {
        return this.getTagsByIds(this.withoutTagsIds);
    }

    setWithoutTags(tagsIds: TagID[]) {
        this.withoutTagsIds.length = 0;
        this.withoutTagsIds.push(...tagsIds);
    }

    get filePaths() {
        if (
            this.fileType === null &&
            this.mediaType === null &&
            this.untagged === false &&
            this.tagsIds.length === 0 &&
            this.withoutTagsIds.length === 0
        ) {
            return this.store.filePaths;
        }

        return this.store.filePaths.filter(filePath => {
            if (this.fileType) {
                if (filePath.fileType !== this.fileType) return false;
            }

            if (this.mediaType) {
                if (filePath.mediaType !== this.mediaType) return false;
            }

            if (this.untagged) {
                const {file} = filePath;
                if (file && file.tagsIds.length > 0) {
                    return false;
                }
            }
            else {
                if (this.tagsIds.length) {
                    const { file } = filePath;
                    if (file) {
                        const hasMissingTags = this.tagsIds.some(tagId => {
                            return file.tagsIds.includes(tagId) === false;
                        });

                        if (hasMissingTags) return false;
                    }
                    else {
                        return false;
                    }
                }

                if (this.withoutTagsIds.length) {
                    const { file } = filePath;
                    if (file) {
                        const hasTags = this.withoutTagsIds.some(tagId => {
                            return file.tagsIds.includes(tagId);
                        });

                        if (hasTags) return false;
                    }
                }
            }

            return true;
        });
    }
}