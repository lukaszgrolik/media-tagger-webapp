import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api/api";
import { File, FileCreateBody, FileID, FileUpdateBody } from "./file";
import { Tag, TagCreateBody, TagID, TagUpdateBody } from "./tag";
import { Tab, TabBody } from "./tab/tab";
import { FilePath, FilePathBody } from "./file-path";

export * from './tag';
export * from './file';

export class Store {
    readonly api;

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
        new Tab(this, {
            filtering: {tagsIds: [11]},
        }),
    ];
    activeTab = this.tabs[0];

    constructor() {
        this.api = new API({
            onResponse: data => {
                if (data.tags && data.tags.length) this.upsertTags(data.tags);
                if (data.files && data.files.length) this.upsertFiles(data.files);

                if (data.removedTagsIds && data.removedTagsIds.length) this.removeTags(data.removedTagsIds);
                if (data.removedFilesIds && data.removedFilesIds.length) this.removeTags(data.removedFilesIds);
            },
        });

        makeObservable(this, {
            filePaths: observable,
            setFilePaths: action,

            files: observable,
            setFiles: action,
            upsertFiles: action,
            removeFiles: action,

            tags: observable,
            setTags: action,
            upsertTags: action,
            removeTags: action,
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

    upsertTags(bodyArr: ({id: TagID} & (TagCreateBody | TagUpdateBody))[]) {
        bodyArr.forEach(body => {
            const found = this.tags.find(t => t.id === body.id);

            if (found) {
                found.update(body);
            }
            else {
                this.tags.push(new Tag(this, body as TagCreateBody));
            }
        });
    }

    removeTags(ids: number[]) {
        ids.forEach(id => {
            const index = this.tags.findIndex(t => t.id === id);
            if (index === -1) {
                console.warn(`tag with id=${id} not found`);
                return;
            }

            this.tags.splice(index, 1);
        });
    }

    get topLevelTags() {
        return this.tags.filter(t => t.parentId === null);
    }

    setFiles(tags: FileCreateBody[]) {
        this.files.length = 0;
        this.files.push(...tags.map(t => new File(this, t)))
    }

    upsertFiles(bodyArr: ({id: FileID} & (FileCreateBody | FileUpdateBody))[]) {
        bodyArr.forEach(body => {
            const found = this.files.find(t => t.id === body.id);

            if (found) {
                found.update(body);
            }
            else {
                this.files.push(new File(this, body as FileCreateBody));
            }
        });
    }

    removeFiles(ids: number[]) {
        ids.forEach(id => {
            const index = this.files.findIndex(t => t.id === id);
            if (index === -1) {
                console.warn(`file with id=${id} not found`);
                return;
            }

            this.files.splice(index, 1);
        });
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