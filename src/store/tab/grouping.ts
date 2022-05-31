import { action, computed, makeObservable, observable, reaction } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";
import { Tab } from "./tab";

export type GroupingMode = null | 'day' | 'month';

export interface GroupingBody {
    readonly mode?: GroupingMode;
}

export class Grouping {
    mode: GroupingMode = null;

    constructor(readonly store: Store, readonly tab: Tab, body: GroupingBody = {}) {
        if (body.mode !== undefined) this.mode = body.mode;

        makeObservable(this, {
            mode: observable,
            setMode: action,
        });
    }

    async setMode(mode: GroupingMode) {
        await this.store.updateActiveTab({
            grouping: {
                mode,
            },
        });

        action(() => {
            this.mode = mode;
        })();
    }
}