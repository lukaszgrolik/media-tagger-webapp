import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api/api";
import { File, FileCreateBody, FileID, FileUpdateBody } from "./file";
import { Tag, TagCreateBody, TagID, TagUpdateBody } from "./tag";
import { Tab, TabCreateBody, TabUpdateBody } from "./tab/tab";
import { FilePath, FilePathBody } from "./file-path";
import { Adapters } from "../lib/json-db/json-db";
import { JsonDBInstance } from "../types";

export * from './file-path';
export * from './tag';
export * from './file';

type Opts = {
    localStorageAdapter: Adapters.LocalStorage,
    localStorageDb: JsonDBInstance,
};

export class Store {
    readonly api;

    readonly filePaths: FilePath[] = [];
    readonly filePaths_indexedBy_path = new Map<string, FilePath>();

    readonly tags: Tag[] = [];
    readonly tags_indexedBy_id = new Map<number, Tag>();

    readonly files: File[] = [];
    // readonly files_indexedBy_id = new Map<number, File>();
    readonly files_indexedBy_path = new Map<string, File>();

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

    activeProjectName: string = ''; // once set, should never be empty
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
            filePaths_indexedBy_path: observable,
            setFilePaths: action,

            files: observable,
            // files_indexedBy_id: observable,
            files_indexedBy_path: observable,
            setFiles: action,
            upsertFiles: action,
            removeFiles: action,

            tags: observable,
            tags_indexedBy_id: observable,
            setTags: action,
            upsertTags: action,
            removeTags: action,
            topLevelTags: computed,

            tabs: observable,
            setTabs: action,
            createTab: action,
            createEmptyTab: action,
            removeTab: action,

            activeProjectName: observable,
            setActiveProjectName: action,

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

    setFilePaths(filePaths: FilePathBody[]) {
        this.filePaths.length = 0;
        this.filePaths.push(...filePaths.map(f => new FilePath(this, f)));

        this.filePaths_indexedBy_path.clear();
        for (let i = 0; i < this.filePaths.length; i++) {
            const filePath = this.filePaths[i];
            this.filePaths_indexedBy_path.set(filePath.path, filePath);
        }
    }

    //
    //
    //

    setTags(tags: TagCreateBody[]) {
        this.tags.length = 0;
        this.tags.push(...tags.map(t => new Tag(this, t)))

        this.tags_indexedBy_id.clear();
        for (let i = 0; i < this.tags.length; i++) {
            const tag = this.tags[i];
            this.tags_indexedBy_id.set(tag.id, tag);
        }
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

        for (let i = 0; i < newTags.length; i++) {
            const tag = newTags[i];
            this.tags_indexedBy_id.set(tag.id, tag);
        }
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

    setFiles(files: FileCreateBody[]) {
        this.files.length = 0;
        this.files.push(...files.map(t => new File(this, t)));

        this.files_indexedBy_path.clear();
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            this.files_indexedBy_path.set(file.path, file);
        }
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

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            this.files_indexedBy_path.set(file.path, file);
        }
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

    async createTab(body: Omit<TabCreateBody, 'id' | 'projectName'>) {
        const res = await this.opts.localStorageDb.insert('tabs', {
            ...body,
            projectName: this.activeProjectName,
        });

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

    async removeTab(tabId: number) {
        if (this.tabs.length === 1) return;

        const tab = this.tabs.find(t => t.id == tabId);
        if (!tab) {
            throw new Error(`tab to remove does not exist (id=${tabId})`);
        }
        else {
            if (tabId === this.activeTabId) {
                this.setActiveTabId(this.tabs[0].id);
            }

            await this.opts.localStorageDb.delete('tabs', tabId);

            const index = this.tabs.indexOf(tab);

            action(() => {
                this.tabs.splice(index, 1);
            })();
        }
    }

    //
    //
    //

    setActiveProjectName(name: string) {
        if (this.activeProjectName) {
            throw new Error(`project name is already set ("${name}")`);
        }

        this.activeProjectName = name;
    }

    setActiveTabId(tabId: number | undefined) {
        if (!tabId) {
            this.activeTabId = undefined;
        }
        else {
            const tab = this.tabs.find(t => t.id === tabId);
            if (!tab) {
                if (this.tabs.length === 0) {
                    this.createEmptyTab();
                }
                else {
                    this.activeTabId = this.tabs[0].id;
                }
            }
            else {
                this.activeTabId = tabId;
            }
        }
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