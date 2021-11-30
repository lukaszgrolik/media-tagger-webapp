import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";
import { Filtering, FilteringBody } from "./filtering";
import { Pagination, PaginationBody } from "./pagination";
import { Sorting, SortingBody } from "./sorting";
import { Config, ConfigBody } from "./tab-config";

export interface TabBody {
    readonly config?: ConfigBody;
    readonly filtering?: FilteringBody;
    readonly sorting?: SortingBody;
    readonly pagination?: PaginationBody;
}

export class Tab {
    readonly config: Config;
    readonly filtering: Filtering;
    readonly sorting: Sorting;
    readonly pagination: Pagination;

    constructor(readonly store: Store, body: TabBody = {}) {
        this.config = new Config(this.store, body.config);
        this.filtering = new Filtering(this.store, body.filtering);
        this.sorting = new Sorting(this.store, this, body.sorting);
        this.pagination = new Pagination(this.store, this, body.pagination);
    }
}

