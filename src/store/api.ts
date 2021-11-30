import { TagID } from "./tag";

interface SetFilesTagsBody {
    filePaths: string[];
    addedTagsIds?: TagID[];
    removedTagsIds?: TagID[];
    newTags?: (string | {name: string; parentId: TagID})[]
}

export class API {
    readonly API_BASE_URL = 'http://localhost:3060';

    getProjectAssetsUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/assets`;
    }

    getProjectThumbnailsUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/thumbnails`;
    }

    getProjectFileUrl(projectName: string, filePath: string) {
        return `${this.getProjectAssetsUrl(projectName)}${filePath}`;
    }

    getProjectFileThumbnailUrl(projectName: string, filePath: string, size: number) {
        const m = filePath.match(/([^\.]+)(\..+)$/);
        if (!m) throw new Error(`invalid filePath: ${filePath}`);

        const [_, basePath, ext] = m;
        const thumbnailFilePath = `${basePath}_${size}${ext}`;

        return `${this.getProjectThumbnailsUrl(projectName)}${thumbnailFilePath}`;
    }

    async fetchProjects() {
        return (await fetch(`${this.API_BASE_URL}/projects`)).json();
    }

    async fetchFilePaths(projectName: string) {
        return (await fetch(`${this.API_BASE_URL}/${projectName}/files`)).json();
    }

    async fetchDB(projectName: string) {
        return (await fetch(`${this.API_BASE_URL}/${projectName}/db`)).json();
    }

    // @todo
    async setFileTags(projectName: string, body: SetFilesTagsBody) {
        fetch(`${this.API_BASE_URL}/${projectName}/db/`, {
            method: 'post',
            // body: JSON.stringify(body),
        });
    }

    async deleteFiles(projectName: string, filePaths: string[]) {

    }

    async createTags(projectName: string, body: {name: string; parentId: TagID | null}[]) {

    }

    async updateTag(projectName: string, tagId: TagID, body: {name: string; parentId: TagID | null}) {

    }

    async updateTags(projectName: string, body: {tagsIds: TagID[], parentId: TagID | null}) {

    }
}