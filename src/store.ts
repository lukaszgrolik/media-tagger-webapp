import { action, makeObservable, observable } from "mobx";

export class Store {
    readonly files: string[] = [];

    constructor() {
        makeObservable(this, {
            files: observable,
            setFiles: action,
        });
    }

    setFiles(files: string[]) {
        this.files.length = 0;
        this.files.push(...files);
    }
}