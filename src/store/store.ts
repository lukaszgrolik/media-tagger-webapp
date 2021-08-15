import { action, computed, makeObservable, observable } from "mobx";

export class Store {
    readonly files: string[] = [];
    readonly tags: Tag[] = [];

    constructor() {
        makeObservable(this, {
            files: observable,
            setFiles: action,

            tags: observable,
            setTags: action,
            topLevelTags: computed,
        });
    }

    setFiles(files: string[]) {
        this.files.length = 0;
        this.files.push(...files);
    }

    setTags(tags: TagCreateBody[]) {
        this.tags.length = 0;
        this.tags.push(...tags.map(t => new Tag(this, t)))
    }

    get topLevelTags() {
        return this.tags.filter(t => t.parentId === null);
    }
}

interface TagCreateBody {
    id: number;
    name: string;
    parentId: number | null;
}

export class Tag {
    readonly id: number;
    name: string;
    parentId: number | null;

    constructor(readonly store: Store, tag: TagCreateBody) {
        this.id = tag.id;
        this.name = tag.name;
        this.parentId = tag.parentId;

        makeObservable(this, {
            name: observable,
            // setName: action,

            parentId: observable,
            // setParentId: action,
            parent: computed,
            children: computed,
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
}