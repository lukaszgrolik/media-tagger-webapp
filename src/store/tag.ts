import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "./store";

export interface TagCreateBody {
    readonly id: number;
    readonly name: string;
    readonly parentId: number | null;
}

export class Tag {
    readonly id: number;
    name: string;
    parentId: number | null;

    constructor(readonly store: Store, body: TagCreateBody) {
        this.id = body.id;
        this.name = body.name;
        this.parentId = body.parentId;

        makeObservable(this, {
            name: observable,
            // setName: action,

            parentId: observable,
            // setParentId: action,
            parent: computed,
            children: computed,

            files: computed,
        });
    }

    // setName(name: string) {
    //     this.name = name;
    // }

    get parent(): Tag | null {
        return this.store.tags.find(t => t.id === this.parentId) || null;
    }

    get children() {
        return this.store.tags.filter(t => t.parentId === this.id);
    }

    get descendants(): Tag[] {
        if (this.children.length === 0) return [];

        return [...this.children, ...this.descendants]
    }

    get files() {
        return this.store.files.filter(f => f.tagsIds.includes(this.id));
    }

    // get filesRecursive() {
    //     // return [this, ...this.descendants].filter(f => f.tagsIds.includes(this.id))
    // }
}