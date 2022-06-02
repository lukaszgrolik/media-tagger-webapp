import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";
import { Tab } from "./tab";

type SortingField = 'path' | 'mtime' | 'fileSize';

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
        return this.tab.filtering.filePaths.slice().sort((fpA, fpB) => {
            const fileA = fpA.file;
            if (!fileA) return -1;
            const fileB = fpB.file;
            if (!fileB) return -1;

            const metaA = fileA.meta;
            const metaB = fileB.meta;

            if (this.field === 'path') {
                if (this.asc)
                    return fileA.path.localeCompare(fileB.path);
                else
                    return fileB.path.localeCompare(fileA.path);
            }
            else if (this.field === 'mtime') {
                if (!metaA.mtime || !metaB.mtime) return -1;

                if (this.asc)
                    return metaA.mtime.localeCompare(metaB.mtime);
                else
                    return metaB.mtime.localeCompare(metaA.mtime);
            }
            else if (this.field === 'fileSize') {
                if (!metaA.fileSize || !metaB.fileSize) return -1;

                if (this.asc)
                    return metaA.fileSize - metaB.fileSize;
                else
                    return metaB.fileSize - metaA.fileSize;
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