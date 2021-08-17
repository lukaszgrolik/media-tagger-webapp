import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "./store";
import { Tag } from "./tag";

export interface FileCreateBody {
    readonly path: string;
    readonly description: string;
    readonly tagsIds: number[];
}

export class File {
    // readonly id: number;
    path: string;
    description: string;
    tagsIds: number[] = [];

    constructor(readonly store: Store, body: FileCreateBody) {
        // this.id = body.id;
        this.path = body.path;
        this.description = body.description;
        this.tagsIds = body.tagsIds;

        makeObservable(this, {
            path: observable,
            // setName: action,

            tagsIds: observable,
            tags: computed,
        });
    }

    get tags() {
        return this.tagsIds.map(tagId => {
            return this.store.tags.find(t => t.id === tagId);
        }).filter(t => t) as Tag[];
    }
}