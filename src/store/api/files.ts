import { FileID } from "../file";
import { TagID } from "../tag";
import { API } from "./api";

type UpdateFilesBody = {
    files: {
        id: FileID;
        description?: string;
        tagsIds?: TagID[];
    }[];
};

type SetFilesTagsBody = {
    filePaths: string[];
    addedTagsIds?: TagID[];
    removedTagsIds?: TagID[];
    newTags?: (string | { name: string; parentId: TagID })[]
}

export class ApiFiles {
    constructor(readonly api: API) {

    }

    async updateFiles(projectName: string, body: UpdateFilesBody) {
        // fetch(`${this.API_BASE_URL}/${projectName}/files/`, {
        //     method: 'put',
        // headers: {
        //     'Content-Type': 'application/json'
        // },
        //     // body: JSON.stringify(body),
        // });
    }

    async setFilesTags(projectName: string, body: SetFilesTagsBody) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/files/tags`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(body),
        });
        const data = await res.json();

        // @todo upsert to store
    }

    async deleteFiles(projectName: string, filePaths: string[]) {

    }
}