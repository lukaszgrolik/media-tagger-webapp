import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api/api";
import { File, FileCreateBody, FileID, FileUpdateBody } from "./file";
import { Tag, TagCreateBody, TagID, TagUpdateBody } from "./tag";
import { Tab, TabCreateBody, TabUpdateBody } from "./tab/tab";
import { FilePath, FilePathBody } from "./file-path";
import { Adapters } from "../lib/json-db/json-db";
import { JsonDBInstance } from "../types";

export * from './tag';
export * from './file';

type Opts = {
    localStorageAdapter: Adapters.LocalStorage,
    localStorageDb: JsonDBInstance,
};

export class Store {
    readonly api;

    readonly filePaths: FilePath[] = [];
    readonly tags: Tag[] = [];
    readonly files: File[] = [];

    readonly tabs: Tab[] = [
        // new Tab(this),
        // new Tab(this, {
        //     pagination: {perPage: 20, currentPage: 10},
        // }),
        // new Tab(this, {
        //     config: {fileHeight: 100},
        // }),
        // new Tab(this, {
        //     filtering: {tagsIds: [11]},
        // }),
    ];
    activeTabId: number | undefined = undefined;

    constructor(readonly opts: Opts) {
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
            setTabs: action,
            createTab: action,
            createEmptyTab: action,

            activeTabId: observable,
            setActiveTabId: action,
            activeTab: computed,
        });
    }

    // folders() {
    //     type Folder = { name: string; folders: Folder[] };
    //     const folders: Folder[] = [];

    //     this.filePaths.map(fp => {
    //         const dirs = fp.path.replace('/', '').split('/').slice(0, -1);

    //         dirs.forEach(dir => {
    //             folders.push
    //         })
    //     });
    // }

    setFilePaths(files: FilePathBody[]) {
        this.filePaths.length = 0;
        this.filePaths.push(...files.map(f => new FilePath(this, f)));
    }

    //
    //
    //

    setTags(tags: TagCreateBody[]) {
        this.tags.length = 0;
        this.tags.push(...tags.map(t => new Tag(this, t)))
    }

    upsertTags(bodyArr: ({id: TagID} & (TagCreateBody | TagUpdateBody))[]) {
        const newTags: Tag[] = []

        bodyArr.forEach(body => {
            const found = this.tags.find(t => t.id === body.id);

            if (found) {
                found.update(body);
            }
            else {
                newTags.push(new Tag(this, body as TagCreateBody));
            }
        });

        this.tags.push(...newTags);
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

    //
    //
    //

    setFiles(tags: FileCreateBody[]) {
        this.files.length = 0;
        this.files.push(...tags.map(t => new File(this, t)))
    }

    upsertFiles(bodyArr: ({id: FileID} & (FileCreateBody | FileUpdateBody))[]) {
        const newFiles: File[] = [];

        bodyArr.forEach(body => {
            const found = this.files.find(t => t.id === body.id);

            if (found) {
                found.update(body);
            }
            else {
                newFiles.push(new File(this, body as FileCreateBody));
            }
        });

        this.files.push(...newFiles);
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

    //
    //
    //

    setTabs(bodyArr: TabCreateBody[]) {
        this.tabs.length = 0;

        const tabs = bodyArr.map(body => {
            return new Tab(this, body);
        });

        this.tabs.push(...tabs);
    }

    async createTab(body: Omit<TabCreateBody, 'id'>) {
        const res = await this.opts.localStorageDb.insert('tabs', body);

        const tab = new Tab(this, res);

        action(() => {
            this.tabs.push(tab);
        })();

        this.setActiveTabId(tab.id);
    }

    async createEmptyTab() {
        await this.createTab({});
    }

    async updateTab(tabId: number, body: TabUpdateBody) {
        const res = await this.opts.localStorageDb.update('tabs', tabId, body, {
            overwriteObjectValues: false,
        });
    }

    async updateActiveTab(body: TabUpdateBody) {
        if (!this.activeTabId) return;

        await this.updateTab(this.activeTabId, body);
    }

    //
    //
    //

    setActiveTabId(tabId: number | undefined) {
        this.activeTabId = tabId;
    }

    get activeTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    async updateProject(body: {activeTabId: number}) {
        await this.opts.localStorageDb.update('projects', 1, {
            activeTabId: body.activeTabId,
        });

        action(() => {
            this.activeTabId = body.activeTabId;
        })();
    }
}