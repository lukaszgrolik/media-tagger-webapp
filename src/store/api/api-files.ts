import { FileID } from "../file";
import { TagID } from "../tag";
import { API } from "./api";

export type UpdateFilesBody = {
    files: (({id: FileID} | {path: string}) & {
        description?: string;
        tagsIds?: TagID[];
    })[];
};

type UpdateFilesTagsBody = {
    ids?: number[];
    filePaths?: string[];
    addedTagsIds?: TagID[];
    removedTagsIds?: TagID[];
    newTags?: (string | { name: string; parentId: TagID })[]
};

export class ApiFiles {
    constructor(readonly api: API) {

    }

    async updateFiles(projectName: string, body: UpdateFilesBody) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/files/`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        this.api.opts.onResponse(data);
    }

    async updateFilesTags(projectName: string, body: UpdateFilesTagsBody) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/files/tags`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        this.api.opts.onResponse(data);
    }

    // async deleteFiles(projectName: string, filePaths: string[]) {

    // }
}