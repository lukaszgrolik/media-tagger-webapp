import { action, computed, makeObservable, observable } from "mobx";

import { Store } from "./store";

export interface FilePathBody {
    readonly path: string;
    readonly ctime: string;
    readonly mtime: string;
    readonly size: number;
    readonly width: number;
    readonly height: number;
}

export interface DateObj {
    year: number;
    month: number;
    day: number;
}

export class FilePath {
    readonly path: string;
    readonly dir: string;
    readonly fileName: string;
    readonly fileExtRaw: string;
    readonly fileExt: string;

    readonly ctime: string;
    readonly mtime: string;
    readonly mtimeDate: DateObj | null;
    readonly size: number;
    readonly width: number;
    readonly height: number;

    readonly fileType: 'image' | 'video';
    readonly mediaType: 'static' | 'animated';

    constructor(readonly store: Store, readonly body: FilePathBody) {
        this.path = body.path;

        const fileM = body.path.match(/^(.+)?\/(.+)\.([^\.]+)$/);
        // if (!fileM) return;

        const [_, dir, fileName, _fileExt] = fileM as RegExpMatchArray;
        // console.log(dir, fileName, _fileExt)

        this.dir = dir;
        this.fileName = fileName;

        this.fileExtRaw = _fileExt;
        this.fileExt = _fileExt.toLowerCase();
        if (this.fileExt === 'jpeg') this.fileExt = 'jpg';

        this.ctime = body.ctime;
        this.mtime = body.mtime;
        this.mtimeDate = this.getDate(this.mtime);
        this.size = body.size;
        this.width = body.width;
        this.height = body.height;

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

    getDate(dateStr: string): DateObj | null {
        const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)

        if (!m) return null;

        const year = parseInt(m[1]);
        const month = parseInt(m[2]);
        const day = parseInt(m[3]);

        return {year, month, day};
    }

    get file() {
        // return this.store.files.find(f => f.path === this.path);
        return this.store.files_indexedBy_path.get(this.path);
    }

    get sizeString() {
        const mb = this.size / (2 ** 10) ** 2;
        const mbInt = Math.round(mb);

        const val = (() => {
            if (mbInt.toString().length < 2)
                return mb.toFixed(1);
            else
                return mbInt;
        })();

        return `${val} MB`;
    }
}