import { Store } from "../store/store";

export class GlobalUtils {
    activeProjectName: string = '';

    constructor(readonly store: Store) {

    }

    async createTags(tags: (string | {name: string; parentId?: number})[]) {
        const bodyTags = tags.map(tag => {
            if (typeof tag === 'string') return {name: tag};

            return tag;
        });

        await this.store.api.tags.createTags(this.activeProjectName, {tags: bodyTags});
    }

    async updateTags() {

    }

    async deleteTags(ids: number[]) {
        await this.store.api.tags.deleteTags(this.activeProjectName, ids);
    }

    async deleteFiles(ids: number[]) {

    }
}