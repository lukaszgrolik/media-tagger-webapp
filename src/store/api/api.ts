import { ApiFiles } from "./api-files";
import { ApiTags } from "./api-tags";

export type UniversalResBody = {
    tags?: {
        id: number;
        createdAt?: string;
        updatedAt?: string;
        name?: string;
        parentId?: null | number;
        rank?: number;
    }[];
    files?: {
        id: number;
        createdAt?: string;
        updatedAt?: string;
        path?: string;
        description?: string;
        tagsIds?: number[];
    }[];
    removedTagsIds?: number[];
    removedFilesIds?: number[];
};

type ApiOpts = {
    onResponse: (data: UniversalResBody) => void;
};

export class API {
    readonly API_BASE_URL = 'http://localhost:3060';

    readonly tags = new ApiTags(this);
    readonly files = new ApiFiles(this);

    constructor(readonly opts: ApiOpts) {

    }

    private getProjectAssetsUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/assets`;
    }

    private getProjectPostersUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/posters`;
    }

    private getProjectThumbnailsUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/thumbnails`;
    }

    getProjectFileUrl(projectName: string, filePath: string) {
        return `${this.getProjectAssetsUrl(projectName)}${filePath}`;
    }

    getProjectFilePosterUrl(projectName: string, posterPath: string) {
        return `${this.getProjectPostersUrl(projectName)}${posterPath}`;
    }

    getProjectFileThumbnailUrl(projectName: string, filePath: string, size: number) {
        const m = filePath.match(/([^\.]+)(\..+)$/);
        if (!m) throw new Error(`invalid filePath: ${filePath}`);

        const [_, basePath, ext] = m;
        const thumbnailFilePath = `${basePath}_${size}${ext}`;

        return `${this.getProjectThumbnailsUrl(projectName)}${thumbnailFilePath}`;
    }

    async fetchProjects() {
        const res = await fetch(`${this.API_BASE_URL}/projects`);
        const data = await res.json();

        return data;
    }

    async fetchFilePaths(projectName: string) {
        const res = await fetch(`${this.API_BASE_URL}/${projectName}/files`);
        // const t0 = performance.now();
        const data = await res.json();
        // const t1 = performance.now();
        // console.log('fetchFilePaths json', t1 - t0);

        return data;
    }

    async fetchDB(projectName: string) {
        const res = await fetch(`${this.API_BASE_URL}/${projectName}/db`);
        // const t0 = performance.now();
        const data = await res.json();
        // const t1 = performance.now();
        // console.log('fetchFilePaths json', t1 - t0);

        return data;
    }
}