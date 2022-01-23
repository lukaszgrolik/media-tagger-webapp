import { action, computed, makeObservable, observable, reaction } from "mobx";
import { FilePath } from "../file-path";

import { Store } from "../store";
import { TagID } from "../tag";
import { Filtering, FilteringBody } from "./filtering";
import { Pagination, PaginationBody } from "./pagination";
import { Sorting, SortingBody } from "./sorting";
import { Config, ConfigBody } from "./tab-config";

export type TabCreateBody = {
    readonly id: number;
} & TabUpdateBody;

export type TabUpdateBody = {
    readonly config?: ConfigBody;
    readonly filtering?: FilteringBody;
    readonly sorting?: SortingBody;
    readonly pagination?: PaginationBody;
    readonly selectedFilePaths?: string[];
}

export class Tab {
    readonly id: number;
    readonly config: Config;
    readonly filtering: Filtering;
    readonly sorting: Sorting;
    readonly pagination: Pagination;

    readonly selectedFilePaths: FilePath[];

    constructor(readonly store: Store, body: TabCreateBody) {
        this.id = body.id;
        this.config = new Config(this.store, body.config);
        this.filtering = new Filtering(this.store, body.filtering);
        this.sorting = new Sorting(this.store, this, body.sorting);
        this.pagination = new Pagination(this.store, this, body.pagination);

        this.selectedFilePaths = (body.selectedFilePaths || []).map(sfp => {
            return store.filePaths.find(fp => fp.path === sfp);
        }).filter(fp => fp) as FilePath[];

        makeObservable(this, {
            selectedFilePaths: observable,
            toggleFilePath: action,
            selectFilePath: action,
            selectFilePaths: action,
            selectFilteredFilePaths: action,
            unselectFilePath: action,
            unselectFilePaths: action,
            unselectAllFilePaths: action,
        });

        reaction(() => this.selectedFilePaths.slice(), filePaths => {
            console.log('filePaths', filePaths)

            this.store.updateActiveTab({
                selectedFilePaths: filePaths.map(fp => fp.path),
            });
        });
    }

    toggleFilePath(filePath: FilePath) {
        if (this.selectedFilePaths.includes(filePath)) {
            this.unselectFilePath(filePath);
        }
        else {
            this.selectFilePath(filePath);
        }
    }

    selectFilePath(filePath: FilePath) {
        this.selectedFilePaths.push(filePath);
    }

    selectFilePaths(filePaths: FilePath[]) {
        this.selectedFilePaths.push(...filePaths);
    }

    selectFilteredFilePaths() {
        this.selectFilePaths(this.filtering.filePaths);
    }

    unselectFilePath(filePath: FilePath) {
        const index = this.selectedFilePaths.indexOf(filePath);

        if (index !== -1) {
            this.selectedFilePaths.splice(index, 1);
        }
    }

    unselectFilePaths(filePaths: FilePath[]) {
        filePaths.forEach(filePath => {
            const index = this.selectedFilePaths.indexOf(filePath);

            if (index !== -1) {
                this.selectedFilePaths.splice(index, 1);
            }
        });
    }

    unselectAllFilePaths() {
        this.selectedFilePaths.length = 0;
    }
}

