import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "./store";

export type TagID = number;

export interface TagCreateBody {
    readonly id: TagID;
    readonly name: string;
    readonly parentId: number | null;
    readonly rank: number;
}
export interface TagUpdateBody {
    readonly name?: string;
    readonly parentId?: number | null;
    readonly rank?: number;
}

export class Tag {
    readonly id: number;
    name: string;
    parentId: number | null;
    rank: number;

    constructor(readonly store: Store, body: TagCreateBody) {
        this.id = body.id;
        this.name = body.name;
        this.parentId = body.parentId || null;
        this.rank = body.rank;

        makeObservable(this, {
            name: observable,
            // setName: action,

            parentId: observable,
            // setParentId: action,
            parent: computed,
            ancestors: computed,
            path: computed,
            children: computed,

            files: computed,

            update: action,
        });
    }

    update(body: TagUpdateBody) {
        if (body.name !== undefined) this.name === body.name;
        if (body.parentId !== undefined) this.parentId === body.parentId;
        if (body.rank !== undefined) this.rank === body.rank;
    }

    // setName(name: string) {
    //     this.name = name;
    // }

    get parent(): Tag | null {
        if (this.parentId === null) return null;

        // return this.store.tags.find(t => t.id === this.parentId);
        return this.store.tags_indexedBy_id.get(this.parentId) || null;
    }

    get ancestors(): Tag[] {
        if (!this.parent) return [];

        return [...this.parent.ancestors, this.parent];
    }

    get path(): Tag[] {
        return [...this.ancestors, this];
    }

    get pathString(): string {
        return this.path.map(t => t.name).join('/');
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