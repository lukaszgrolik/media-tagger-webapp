import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api";
import { File, FileCreateBody } from "./file";
import { Tag, TagCreateBody, TagID } from "./tag";
import { Tab, TabBody } from "./tab/tab";
import { FilePath, FilePathBody } from "./file-path";

export * from './tag';
export * from './file';

export class Store {
    readonly api = new API();

    readonly filePaths: FilePath[] = [];
    readonly tags: Tag[] = [];
    readonly files: File[] = [];

    readonly tabs = [
        new Tab(this),
        new Tab(this, {
            pagination: {perPage: 20, currentPage: 10},
        }),
        new Tab(this, {
            config: {fileHeight: 100},
        }),
    ];
    activeTab = this.tabs[0];

    constructor() {
        makeObservable(this, {
            filePaths: observable,
            setFilePaths: action,

            files: observable,
            setFiles: action,

            tags: observable,
            setTags: action,
            topLevelTags: computed,

            tabs: observable,
            activeTab: observable,
            setActiveTab: action,
            addTab: action,
        });
    }

    setFilePaths(files: FilePathBody[]) {
        this.filePaths.length = 0;
        this.filePaths.push(...files.map(f => new FilePath(this, f)));
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

    setActiveTab(tab: Tab) {
        this.activeTab = tab;
    }

    addTab(body: TabBody) {
        const tab = new Tab(this, body);

        this.tabs.push(tab);
        this.activeTab = tab;
    }
}