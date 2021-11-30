import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";

type FileType = 'image' | 'video';
type MediaType = 'static' | 'animated';

export interface FilteringBody {
    readonly name?: string;
    readonly fileType?: FileType | null;
    readonly mediaType?: MediaType | null;
    readonly tagsIds?: TagID[];
}

export class Filtering {
    name = '';
    fileType: FileType | null = null;
    mediaType: MediaType | null = null;
    // minDate: string | null = null;
    // maxDate: string | null = null;
    readonly tagsIds: TagID[] = [];
    // negateTags = false;

    constructor(readonly store: Store, body: FilteringBody = {}) {
        if (body.name !== undefined) this.name = body.name;
        if (body.fileType !== undefined) this.fileType = body.fileType;
        if (body.mediaType !== undefined) this.mediaType = body.mediaType;
        if (body.tagsIds !== undefined) this.tagsIds = body.tagsIds;

        makeObservable(this, {
            fileType: observable,
            setFileType: action,

            mediaType: observable,
            setMediaType: action,

            tagsIds: observable,
            addTag: action,
            removeTag: action,
            setTags: action,

            filePaths: computed,
        });
    }

    setFileType(value: FileType | null) {
        this.fileType = value;
    }

    setMediaType(value: MediaType | null) {
        this.mediaType = value;
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

    get filePaths() {
        if (this.fileType === null && this.mediaType === null && this.tagsIds.length === 0) return this.store.filePaths;

        return this.store.filePaths.filter(filePath => {
            if (this.fileType) {
                if (filePath.fileType !== this.fileType) return false;
            }

            if (this.mediaType) {
                if (filePath.mediaType !== this.mediaType) return false;
            }

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

            return true;
        });
    }
}