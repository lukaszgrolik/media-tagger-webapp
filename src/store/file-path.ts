import { action, computed, makeObservable, observable } from "mobx";
import { DateTime, Interval } from 'luxon';

import { Store } from "./store";

export interface FilePathBody {
    readonly path: string;
}

export class FilePath {
    readonly path: string;
    readonly dir: string;
    readonly fileName: string;
    readonly fileExtRaw: string;
    readonly fileExt: string;

    readonly fileType: 'image' | 'video';
    readonly mediaType: 'static' | 'animated';

    constructor(readonly store: Store, readonly body: FilePathBody) {
        this.path = body.path;

        const fileM = body.path.match(/^(.+)?\/(.+)\.([^\.]+)$/);
        // if (!fileM) return;

        const [_, dir, fileName, fileExt] = fileM as RegExpMatchArray;
        // console.log(dir, fileName, fileExt)

        this.dir = dir;
        this.fileName = fileName;

        this.fileExtRaw = fileExt;
        this.fileExt = fileExt.toLowerCase();
        if (this.fileExt === 'jpeg') this.fileExt = 'jpg';

        this.fileType = (() => {
            if (['jpg', 'png', 'gif', 'svg', 'webp'].includes(this.fileExt)) return 'image';
            else if (['mp4', 'webm'].includes(this.fileExt)) return 'video';
            else throw new Error(`unsupported file type: ${this.fileExt}`);
        })();

        this.mediaType = (() => {
            if (['jpg', 'png', 'svg', 'webp'].includes(this.fileExt)) return 'static';
            else if (['gif', 'mp4', 'webm'].includes(this.fileExt)) return 'animated';
            else throw new Error(`unsupported media type: ${this.fileExt}`);
        })();

        makeObservable(this, {
            file: computed,
        });
    }

    get file() {
        // return this.store.files.find(f => f.path === this.path);
        return this.store.files_indexedBy_path.get(this.path);
    }
}