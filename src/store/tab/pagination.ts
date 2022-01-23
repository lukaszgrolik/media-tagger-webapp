import { action, computed, makeObservable, observable, reaction } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";
import { Tab } from "./tab";

export interface PaginationBody {
    readonly perPage?: number;
    readonly currentPage?: number;
}

export class Pagination {
    perPage: number = 100;
    currentPage = 0;

    constructor(readonly store: Store, readonly tab: Tab, body: PaginationBody = {}) {
        if (body.perPage !== undefined) this.perPage = body.perPage;
        if (body.currentPage !== undefined) this.currentPage = body.currentPage;

        makeObservable(this, {
            perPage: observable,
            setPerPage: action,

            currentPage: observable,
            setCurrentPage: action,
            isFirstPage: computed,
            isLastPage: computed,
            goToPrevPage: action,
            goToNextPage: action,

            filePaths: computed,
            pagesCount: computed,
        });

        reaction(() => this.pagesCount, pagesCount => {
            if (this.currentPage > pagesCount - 1) {
                this.setCurrentPage(pagesCount - 1);
            }
        });
    }

    get filePaths() {
        const start = this.currentPage * this.perPage;
        const end = start + this.perPage;

        return this.tab.sorting.filePaths.slice(start, end);
    }

    get pagesCount() {
        return Math.ceil(this.tab.filtering.filePaths.length / this.perPage);
    }

    async setPerPage(value: number) {
        if (!value) return;

        const max = 100;
        if (value > max) console.warn(`too big value: ${value} - set to ${max} instead`);

        const validValue = Math.min(value, max);

        await this.store.updateActiveTab({
            pagination: {
                perPage: validValue,
            },
        });

        action(() => {
            this.perPage = validValue;
        })();
    }

    async setCurrentPage(value: number) {
        if (value < 0) return;
        if (value >= this.pagesCount) return;

        await this.store.updateActiveTab({
            pagination: {
                currentPage: value,
            },
        });

        action(() => {
            this.currentPage = value;
        })();
    }

    get isFirstPage() {
        return this.currentPage === 0;
    }

    get isLastPage() {
        return this.currentPage === this.pagesCount - 1
    }

    goToPrevPage() {
        if (this.isFirstPage) return;

        this.setCurrentPage(this.currentPage - 1);
    }

    goToNextPage() {
        if (this.isLastPage) return;

        this.setCurrentPage(this.currentPage + 1);
    }
}