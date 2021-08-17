import { action, computed, makeObservable, observable } from "mobx";

import { File, FileCreateBody } from "./file";
import { Tag, TagCreateBody } from "./tag";

export * from './tag';
export * from './file';

export class Store {
    readonly filePaths: string[] = [];

    readonly tags: Tag[] = [];
    readonly files: File[] = [];

    constructor() {
        makeObservable(this, {
            setFilePaths: action,

            files: observable,
            setFiles: action,

            tags: observable,
            setTags: action,
            topLevelTags: computed,
        });
    }

    setFilePaths(files: string[]) {
        this.filePaths.length = 0;
        this.filePaths.push(...files);
    }

    setTags(tags: TagCreateBody[]) {
        this.tags.length = 0;
        this.tags.push(...tags.map(t => new Tag(this, t)))
    }

    get topLevelTags() {
        return this.tags.filter(t => t.parentId === null);
    }

    setFiles(tags: FileCreateBody[]) {
        this.files.length = 0;
        this.files.push(...tags.map(t => new File(this, t)))
    }
}

