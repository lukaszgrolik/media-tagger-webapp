import { DateTime } from "luxon";
import { action, computed, makeObservable, observable } from "mobx";
import { humanFileSize } from "../lib/utils";

import { Store } from "./store";
import { Tag, TagID } from "./tag";

export type FileID = number;

export interface FileCreateBody {
    readonly id: FileID;
    readonly path: string;
    readonly description: string;
    readonly tagsIds: TagID[];
    readonly meta?: {
        mtime?: string;
        fileSize: number;
        poster?: string;
        thumbnails?: {[height: string]: string};
    };
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
    readonly meta: {
        mtime: string | undefined;
        fileSize: number | undefined;
        poster: string | null | undefined;
        thumbnails: {[height: string]: string} | null | undefined;
    };

    constructor(readonly store: Store, body: FileCreateBody) {
        this.id = body.id;
        this.path = body.path;
        this.description = body.description || '';
        this.tagsIds = body.tagsIds;
        this.meta = {
            mtime: body.meta?.mtime,
            fileSize: body.meta?.fileSize,
            poster: body.meta?.poster,
            thumbnails: body.meta?.thumbnails,
        };

        makeObservable(this, {
            path: observable,
            // setName: action,

            filePath: computed,

            tagsIds: observable,
            tags: computed,
            setTags: action,

            meta: observable,
            mtimeDate: computed,
            fileSizeString: computed,

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
        // return this.store.filePaths.find(fp => fp.path === this.path);
        return this.store.filePaths_indexedBy_path.get(this.path);
    }

    get tags() {
        return this.tagsIds.map(tagId => {
            // return this.store.tags.find(t => t.id === tagId);
            return this.store.tags_indexedBy_id.get(tagId);
        }).filter(t => t) as Tag[];
    }

    get mtimeDate() {
        return this.meta.mtime ? DateTime.fromISO(this.meta.mtime) : undefined;
    }

    get fileSizeString() {
        if (!this.meta.fileSize) return 0;

        return humanFileSize(this.meta.fileSize, true);
    }
}