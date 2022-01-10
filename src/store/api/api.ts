import { ApiFiles } from "./files";
import { ApiTags } from "./tags";

export class API {
    readonly API_BASE_URL = 'http://localhost:3060';

    readonly tags = new ApiTags(this);
    readonly files = new ApiFiles(this);

    private getProjectAssetsUrl(projectName: string) {
        return `${this.API_BASE_URL}/${projectName}/assets`;
    }

    private getProjectThumbnailsUrl(projectName: string) {
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
}