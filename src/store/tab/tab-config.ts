import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "../store";
import { TagID } from "../tag";

export interface ConfigBody {
    readonly fileWidth?: number;
    readonly fileHeight?: number;
}

export class Config {
    fileWidth = 480;
    fileHeight = 270;

    constructor(readonly store: Store, body: ConfigBody = {}) {
        if (body.fileWidth !== undefined) this.fileWidth = body.fileWidth;
        if (body.fileHeight !== undefined) this.fileHeight = body.fileHeight;

        makeObservable(this, {
            fileWidth: observable,
            fileHeight: observable,

            setFileHeight: action,
        });
    }

    setFileHeight(value: number) {
        this.fileHeight = value;
    }
}