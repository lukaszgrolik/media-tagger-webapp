import { action, computed, makeObservable, observable } from "mobx";

import { API } from "./api";
import { File, FileCreateBody } from "./file";
import { Tag, TagCreateBody, TagID } from "./tag";

export * from './tag';
export * from './file';

// function moveItem<T, S>(arr: T[], cb: (i: T) => S, items: S[], newIndex: number): T[] {
function moveItem<T>(arr: T[], items: T[], newIndex: number): {result: T[]; changes: [T, number][]} {
    // @todo newIndex must be less or equal than arr.length
    // @todo arr items must be unique
    // @todo items must not contain an element at newIndex

    const arrTemp = arr.slice();
    const newIndexCurrentItem = arrTemp[newIndex];

    items.forEach(i => {
        const index = arrTemp.indexOf(i);

        if (index !== -1) {
            arrTemp.splice(index, 1);
        }
    });

    const index = newIndex !== arr.length ? arrTemp.indexOf(newIndexCurrentItem) : arrTemp.length;
    arrTemp.splice(index, 0, ...items);

    const res: [T, number][] = [];

    items.forEach((a, i) => {
        const j = arrTemp.indexOf(a);

        if (i !== j) {
            res.push([a, i]);
        }
    });

    return {
        result: arrTemp,
        changes: res,
    };
}

moveItem(['a', 'b', 'c', 'd'], ['c'], 0);
moveItem(['a', 'b', 'c', 'd'], ['c'], 1); // => [['c', 1], ['b', 2]]
moveItem(['a', 'b', 'c', 'd'], ['c'], 0);

moveItem(['a', 'b', 'c', 'd'], ['c', 'd'], 1); // => [['c', 1], ['d', 2], ['b', 3]]

moveItem(['a', 'b', 'c', 'd'], ['e'], 0);
moveItem(['a', 'b', 'c', 'd'], ['e'], 1);
moveItem(['a', 'b', 'c', 'd'], ['e'], 4);
moveItem(['a', 'b', 'c', 'd'], ['e'], 5);

moveItem(['a', 'b', 'c', 'd'], ['e', 'f'], 0);
moveItem(['a', 'b', 'c', 'd'], ['e', 'f'], 1);
moveItem(['a', 'b', 'c', 'd'], ['e', 'f'], 4);
moveItem(['a', 'b', 'c', 'd'], ['e', 'f'], 5);

moveItem(['a', 'b', 'c', 'd'], ['b', 'f'], 0);
moveItem(['a', 'b', 'c', 'd'], ['a', 'f'], 1);
moveItem(['a', 'b', 'c', 'd'], ['a', 'f'], 4);
moveItem(['a', 'b', 'c', 'd'], ['a', 'f'], 5);

interface FilePathBody {
    readonly path: string;
    readonly ctime: string;
    readonly mtime: string;
    readonly size: number;
}

class FilePath {
    readonly path: string;
    readonly dir: string;
    readonly fileName: string;
    readonly fileExtRaw: string;
    readonly fileExt: string;

    readonly ctime: string;
    readonly mtime: string;
    readonly size: number;

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
        this.size = body.size;

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

class Project {
    constructor(readonly store: Store, readonly name: string) {

    }
}

interface TabBody {
    readonly config?: ConfigBody;
    readonly filtering?: FilteringBody;
    readonly sorting?: SortingBody;
    readonly pagination?: PaginationBody;
}

class Tab {
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

export class Store {
    readonly api = new API();

    readonly filePaths: FilePath[] = [];
    readonly tags: Tag[] = [];
    readonly files: File[] = [];

    readonly tabs = [
        new Tab(this),
        new Tab(this, {
            pagination: {perPage: 20, currentPage: 10},
        }),
        new Tab(this, {
            config: {fileHeight: 100},
        }),
    ];
    activeTab = this.tabs[0];

    constructor() {
        makeObservable(this, {
            filePaths: observable,
            setFilePaths: action,

            files: observable,
            setFiles: action,

            tags: observable,
            setTags: action,
            topLevelTags: computed,

            tabs: observable,
            activeTab: observable,
            setActiveTab: action,
            addTab: action,
        });
    }

    setFilePaths(files: FilePathBody[]) {
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

    setActiveTab(tab: Tab) {
        this.activeTab = tab;
    }

    addTab(body: TabBody) {
        const tab = new Tab(this, body);

        this.tabs.push(tab);
        this.activeTab = tab;
    }
}

interface PaginationBody {
    readonly perPage?: number;
    readonly currentPage?: number;
}

class Pagination {
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
    }

    get filePaths() {
        const start = this.currentPage * this.perPage;
        const end = start + this.perPage;

        return this.tab.sorting.filePaths.slice(start, end);
    }

    get pagesCount() {
        return Math.ceil(this.tab.filtering.filePaths.length / this.perPage);
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

interface ConfigBody {
    readonly fileWidth?: number;
    readonly fileHeight?: number;
}

class Config {
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

type FileType = 'image' | 'video';
type MediaType = 'static' | 'animated';

interface FilteringBody {
    readonly name?: string;
    readonly fileType?: FileType | null;
    readonly mediaType?: MediaType | null;
    readonly tagsIds?: TagID[];
}

class Filtering {
    name = '';
    fileType: FileType | null = null;
    mediaType: MediaType | null = null;
    // minDate: string | null = null;
    // maxDate: string | null = null;
    readonly tagsIds: TagID[] = [];
    // negateTags = false;

    constructor(readonly store: Store, body: FilteringBody = {}) {
        if (body.name !== undefined) this.name = body.name;
        if (body.fileType !== undefined) this.fileType = body.fileType;
        if (body.mediaType !== undefined) this.mediaType = body.mediaType;
        if (body.tagsIds !== undefined) this.tagsIds = body.tagsIds;

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

            if (this.tagsIds.length) {
                const {file} = filePath;
                if (file) {
                    const hasMissingTags = this.tagsIds.some(tagId => {
                        return file.tagsIds.includes(tagId) === false;
                    });

                    if (hasMissingTags) return false;
                }
                else {
                    return false;
                }
            }

            return true;
        });
    }
}

type SortingField = 'path' | 'mtime' | 'size';

interface SortingBody {
    readonly field?: SortingField;
    readonly asc?: boolean;
}

class Sorting {
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

    setSorting(field: SortingField, asc: boolean) {
        this.field = field;
        this.asc = asc;
    }
}