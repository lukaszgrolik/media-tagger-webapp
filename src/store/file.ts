import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "./store";
import { Tag, TagID } from "./tag";

export type FileID = number;

export interface FileCreateBody {
    readonly id: FileID;
    readonly path: string;
    readonly description: string;
    readonly tagsIds: TagID[];
}

export interface FileUpdateBody {
    readonly description?: string;
    readonly tagsIds?: TagID[];
}

export class File {
    readonly id: number;
    path: string;
    description: string;
    readonly tagsIds: number[] = [];

    constructor(readonly store: Store, body: FileCreateBody) {
        this.id = body.id;
        this.path = body.path;
        this.description = body.description || '';
        this.tagsIds = body.tagsIds;

        makeObservable(this, {
            path: observable,
            // setName: action,

            filePath: computed,

            tagsIds: observable,
            tags: computed,
            setTags: action,

            update: action,
        });
    }

    update(body: FileUpdateBody) {
        if (body.description !== undefined) this.description = body.description;
        if (body.tagsIds !== undefined) this.setTags(body.tagsIds);
    }

    setTags(ids: number[]) {
        this.tagsIds.length = 0;
        this.tagsIds.push(...ids);
    }

    get filePath() {
        return this.store.filePaths.find(fp => fp.path === this.path);
    }

    get tags() {
        return this.tagsIds.map(tagId => {
            return this.store.tags.find(t => t.id === tagId);
        }).filter(t => t) as Tag[];
    }
}