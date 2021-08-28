import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api";
import { File, FileCreateBody } from "./file";
import { Tag, TagCreateBody, TagID } from "./tag";

export * from './tag';
export * from './file';

class FilePath {
    readonly dir: string;
    readonly fileName: string;
    readonly fileExtRaw: string;
    readonly fileExt: string;
    readonly fileType: 'image' | 'video';
    readonly mediaType: 'static' | 'animated';

    constructor(readonly store: Store, readonly path: string) {
        const fileM = path.match(/^(.+)?\/(.+)\.([^\.]+)$/);
        // if (!fileM) return;

        const [_, dir, fileName, _fileExt] = fileM as RegExpMatchArray;
        // console.log(dir, fileName, _fileExt)

        this.dir = dir;
        this.fileName = fileName;

        this.fileExtRaw = _fileExt;
        this.fileExt = _fileExt.toLowerCase();
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
        return this.store.files.find(f => f.path === this.path);
    }
}

class Project {
    constructor(readonly store: Store, readonly name: string) {

    }
}



export class Store {
    readonly api = new API();
    readonly config = new Config(this);
    readonly filtering = new Filtering(this);
    readonly sorting = new Sorting(this);
    readonly pagination = new Pagination(this);

    readonly filePaths: FilePath[] = [];

    readonly tags: Tag[] = [];
    readonly files: File[] = [];

    constructor() {
        makeObservable(this, {
            filePaths: observable,
            setFilePaths: action,

            files: observable,
            setFiles: action,

            tags: observable,
            setTags: action,
            topLevelTags: computed,
        });
    }

    setFilePaths(files: string[]) {
        this.filePaths.length = 0;
        this.filePaths.push(...files.map(f => new FilePath(this, f)));
    }

    setTags(tags: TagCreateBody[]) {
        this.tags.length = 0;
        this.tags.push(...tags.map(t => new Tag(this, t)))
    }

    get topLevelTags() {
        return this.tags.filter(t => t.parentId === null);
    }

    setFiles(tags: FileCreateBody[]) {
        this.files.length = 0;
        this.files.push(...tags.map(t => new File(this, t)))
    }
}

class Pagination {
    perPage: number = 100;
    currentPage = 0;

    constructor(readonly store: Store) {
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
    }

    get filePaths() {
        const start = this.currentPage * this.perPage;
        const end = start + this.perPage;

        return this.store.sorting.filePaths.slice(start, end);
    }

    get pagesCount() {
        console.log(this.store.filtering.filePaths.length, this.perPage)
        return Math.ceil(this.store.filtering.filePaths.length / this.perPage);
    }

    setPerPage(value: number) {
        const max = 100;
        this.perPage = Math.min(value, max);

        if (value > max) console.warn(`too big value: ${value} - set to ${max} instead`);
    }

    setCurrentPage(value: number) {
        if (value < 0) return;
        if (value >= this.pagesCount) return;

        this.currentPage = value;
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

class Config {
    fileWidth = 480;
    fileHeight = 270;

    constructor(readonly store: Store) {
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

type FileType = 'image' | 'video';
type MediaType = 'static' | 'animated';

class Filtering {
    name = '';
    fileType: FileType | null = null;
    mediaType: MediaType | null = null;
    readonly tagsIds: TagID[] = [];

    constructor(readonly store: Store) {
        makeObservable(this, {
            fileType: observable,
            setFileType: action,

            mediaType: observable,
            setMediaType: action,

            tagsIds: observable,
            addTag: action,
            removeTag: action,
            setTags: action,

            filePaths: computed,
        });
    }

    setFileType(value: FileType | null) {
        this.fileType = value;
    }

    setMediaType(value: MediaType | null) {
        this.mediaType = value;
    }

    addTag(tagId: TagID) {
        this.tagsIds.push(tagId);
    }

    removeTag(tagId: TagID) {
        const index = this.tagsIds.indexOf(tagId);

        if (index !== -1) this.tagsIds.splice(index, 1);
    }

    setTags(tagsIds: TagID[]) {
        this.tagsIds.length = 0;
        this.tagsIds.push(...tagsIds);
    }

    get filePaths() {
        if (this.fileType === null && this.mediaType === null && this.tagsIds.length === 0) return this.store.filePaths;

        return this.store.filePaths.filter(filePath => {
            if (this.fileType) {
                if (filePath.fileType !== this.fileType) return false;
            }

            if (this.mediaType) {
                if (filePath.mediaType !== this.mediaType) return false;
            }

            const {file} = filePath;
            if (file) {
                const hasMissingTags = this.tagsIds.some(tagId => {
                    return file.tagsIds.includes(tagId) === false;
                });

                if (hasMissingTags) return false;
            }

            return true;
        });
    }
}

class Sorting {
    sorting: 'asc' | 'desc' = 'asc';

    constructor(readonly store: Store) {
        makeObservable(this, {
            sorting: observable,
            setSorting: action,

            filePaths: computed,
        });
    }

    get filePaths() {
        // @todo sort by file creation date
        // return this.store.filtering.filePaths.slice().sort((a, b) => )
        return this.store.filtering.filePaths;
    }

    setSorting(value: 'asc' | 'desc') {
        this.sorting = value;
    }
}