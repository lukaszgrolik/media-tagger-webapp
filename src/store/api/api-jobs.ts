import { API } from "./api";

type JobsResBody = {
    jobs: {
        id: number;
        name: string;
        createdAt: string;
        finishedAt: string | undefined;
        // progress: {
        //     count: number;
        //     progress: number;
        //     date: string;
        // };
        progress: number;
        files: unknown[];
        // failed: {
        //     path: string;
        //     error: string;
        // }[];
        failed: {}[];
        // succeeded: {
        //     src: string;
        //     dest: string;
        // }[];
        succeeded: {}[];
    }[];
};

export class ApiJobs {
    constructor(readonly api: API) {

    }

    async fetchJobs(projectName: string): Promise<JobsResBody> {
        const res = await fetch(`${this.api.API_BASE_URL}/${projectName}/jobs`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data: JobsResBody = await res.json();

        return data;

        // this.api.opts.onResponse(data);
    }
}