import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";
import { Tab } from "./tab";

type SortingField = 'path' | 'mtime' | 'size';

export interface SortingBody {
    readonly field?: SortingField;
    readonly asc?: boolean;
}

export class Sorting {
    field: SortingField = 'mtime';
    asc = true;

    constructor(readonly store: Store, readonly tab: Tab, body: SortingBody = {}) {
        if (body.field !== undefined) this.field = body.field;
        if (body.asc !== undefined) this.asc = body.asc;

        makeObservable(this, {
            field: observable,
            asc: observable,
            setSorting: action,

            filePaths: computed,
        });
    }

    get filePaths() {
        // @todo sort by file creation date
        // return this.store.filtering.filePaths.slice().sort((a, b) => )
        return this.tab.filtering.filePaths.slice().sort((a, b) => {
            if (this.field === 'path' || this.field === 'mtime') {
                if (this.asc)
                    return a[this.field].localeCompare(b[this.field]);
                else
                    return b[this.field].localeCompare(a[this.field]);
            }
            else if (this.field === 'size') {
                if (this.asc)
                    return a[this.field] - b[this.field];
                else
                    return b[this.field] - a[this.field];
            }

            return 0;
        });
    }

    async setSorting(field: SortingField, asc: boolean) {
        await this.store.updateActiveTab({
            sorting: {
                field,
                asc,
            },
        });

        action(() => {
            this.field = field;
            this.asc = asc;
        })();
    }
}