import { FileID } from "../file";
import { TagID } from "../tag";
import { API } from "./api";

type CreateTagsBody = {
    tags: {
        name: string;
        parentId?: null | number;
        rank?: number;
    }[];
};
type UpdateTagsBody = {
    tags: {
        id: TagID;
        name?: string;
        parentId?: null | number;
        rank?: number;
    }[];
};

export class ApiTags {
    constructor(readonly api: API) {

    }

    async createTags(projectName: string, body: CreateTagsBody) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/tags`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        // @todo upsert to store
    }

    // async updateTag(projectName: string, tagId: TagID, body: {name: string; parentId: TagID | null}) {

    // }

    async updateTags(projectName: string, body: UpdateTagsBody) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/tags`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        // @todo upsert to store
    }

    async deleteTags(projectName: string, tagsIds: TagID[]) {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/tags`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({tagsIds}),
        });
        const data = await res.json();

        // @todo upsert to store
    }
}