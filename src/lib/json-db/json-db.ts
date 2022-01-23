import * as Adapters from './adapters';
import PromiseQueue from './promise-queue';

export * as Adapters from './adapters';

export type RecordId = number;

export type CollectionsObj<T> = {
    [C in keyof T]: T[C][];
}

export interface FileContent<T> {
    readonly counters: {
        [C in keyof T]: number;
    };
    readonly collections: CollectionsObj<T>;
}

export function getEmptyFileContents(collNames: string[]) {
    const res: { counters: {[key: string]: number}, collections: {[key: string]: {}[]} } = { counters: {}, collections: {} };

    for (const collName of collNames) {
        res.counters[collName] = 0;
        res.collections[collName] = [];
    }

    return res;
};

interface CommonFields {
    id: RecordId;
    createdAt: string;
    updatedAt: string;
}

interface Opts<T extends { [K in keyof T]: CommonFields }> {
    readonly adapter: Adapters.JsonDbAdapter;
    readonly backupFile?: boolean;
    readonly hooks?: {
        [C in keyof T]?: {
            beforeInsert?: (body: Omit<T[C], keyof CommonFields>) => void | Promise<void>;
            beforeUpdate?: (id: RecordId, body: Partial<Omit<T[C], keyof CommonFields>>) => void | Promise<void>;
            beforeDelete?: (id: RecordId) => void | Promise<void>;
            afterInsert?: (record: T[C]) => void | Promise<void>;
            afterUpdate?: (record: T[C]) => void | Promise<void>;
            afterDelete?: (record: T[C]) => void | Promise<void>;
        };
    }
}

export class JsonDB<
    T extends { [K in keyof T]: CommonFields }
> {
    private writeOpsQueue = new PromiseQueue();

    constructor(readonly opts: Opts<T>) {

    }

    private getDateString(): string {
        return new Date().toISOString();
    }

    private readDbRaw() {
        return this.opts.adapter.read();
    }

    private writeDbRaw(str: string) {
        return this.opts.adapter.write(str);
    }

    private async loadData(): Promise<FileContent<T>> {
        const text = await this.readDbRaw();

        return JSON.parse(text);
    }

    private saveData(data: FileContent<T>) {
        return this.writeDbRaw(JSON.stringify(data, null, 2));
    }

    private preValidateBody<C extends keyof T>(body: Partial<Omit<T[C], keyof CommonFields>>) {
        Object.entries(body).forEach(([key, val]) => {
            if (val === undefined) throw new Error(`invalid undefined value for key "${key}"`);
        });
    }

    async read(): Promise<CollectionsObj<T>> {
        const fileContent = await this.loadData();

        return fileContent.collections;
    }

    private async insertOp<C extends keyof T>(collName: C, body: Omit<T[C], keyof CommonFields>): Promise<T[C]> {
        this.preValidateBody(body);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.beforeInsert) await collHooks.beforeInsert(body);
        }

        const fileContent = await this.loadData();
        const date = this.getDateString();

        const baseObj: CommonFields = {
            id: ++fileContent.counters[collName],
            createdAt: date,
            updatedAt: date,
        };
        const record = {
            ...baseObj,
            ...body,
        } as T[C];

        fileContent.collections[collName].push(record);

        await this.saveData(fileContent);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.afterInsert) await collHooks.afterInsert(record);
        }

        return record;
    }

    async insert<C extends keyof T>(collName: C, body: Omit<T[C], keyof CommonFields>): Promise<T[C]> {
        return this.writeOpsQueue.enqueue(() => {
            return this.insertOp(collName, body);
        });
    }

    private async insertManyOp<C extends keyof T>(collName: C, bodyArr: Omit<T[C], keyof CommonFields>[]): Promise<T[C][]> {
        for (const body of bodyArr) {
            this.preValidateBody(body);
        }

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];

            for (const body of bodyArr) {
                if (collHooks && collHooks.beforeInsert) await collHooks.beforeInsert(body);
            }
        }

        const fileContent = await this.loadData();
        const date = this.getDateString();

        const baseObj: CommonFields = {
            id: 0,
            createdAt: date,
            updatedAt: date,
        };
        const records = bodyArr.map(body => {
            const record = {
                ...baseObj,
                ...body,
            } as T[C];
            record.id = ++fileContent.counters[collName];

            return record;
        });

        fileContent.collections[collName].push(...records);

        await this.saveData(fileContent);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];

            for (const record of records) {
                if (collHooks && collHooks.afterInsert) await collHooks.afterInsert(record);
            }
        }

        return records;
    }

    async insertMany<C extends keyof T>(collName: C, bodyArr: Omit<T[C], keyof CommonFields>[]): Promise<T[C][]> {
        return this.writeOpsQueue.enqueue(() => {
            return this.insertManyOp(collName, bodyArr);
        });
    }

    private async updateOp<C extends keyof T>(
        collName: C,
        id: RecordId,
        body: Partial<Omit<T[C], keyof CommonFields>>,
        opOpts: { overwriteObjectValues: boolean }
    ): Promise<T[C]> {
        this.preValidateBody(body);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.beforeUpdate) await collHooks.beforeUpdate(id, body);
        }

        const fileContent = await this.loadData();
        const record = fileContent.collections[collName].find(rec => rec.id === id);
        if (!record) throw new Error(`record not found (id=${id})`);

        const updatedAt = this.getDateString();

        if (opOpts.overwriteObjectValues) {
            Object.assign(record, { updatedAt }, body);
        }
        else {
            record.updatedAt = updatedAt;

            const updateObj = (objA: {}, objB: {}) => {
                Object.entries(objB).forEach(([key, val]) => {
                    if (val instanceof Object && val instanceof Array === false) {
                        if (key in objA === false) {
                            (objA as any)[key] = {};
                        }

                        updateObj((objA as any)[key], val)
                    }
                    else {

                        (objA as any)[key] = val;
                    }
                });
            };

            updateObj(record, body);
        }

        await this.saveData(fileContent);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.afterUpdate) await collHooks.afterUpdate(record);
        }

        return record;
    }

    async update<C extends keyof T>(
        collName: C,
        id: RecordId,
        body: Partial<Omit<T[C], keyof CommonFields>>,
        opOpts: { overwriteObjectValues: boolean } = { overwriteObjectValues: true }
    ): Promise<T[C]> {
        return this.writeOpsQueue.enqueue(() => {
            return this.updateOp(collName, id, body, opOpts);
        });
    }

    private async deleteOp<C extends keyof T>(collName: C, id: RecordId): Promise<T[C]> {
        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.beforeDelete) await collHooks.beforeDelete(id);
        }

        const fileContent = await this.loadData();
        const record = fileContent.collections[collName].find(rec => rec.id === id);
        if (!record) throw new Error(`record not found (id=${id})`);

        const index = fileContent.collections[collName].indexOf(record);
        fileContent.collections[collName].splice(index, 1);

        await this.saveData(fileContent);

        if (this.opts.hooks && this.opts.hooks[collName]) {
            const collHooks = this.opts.hooks[collName];
            if (collHooks && collHooks.afterDelete) await collHooks.afterDelete(record);
        }

        return record;
    }

    async delete<C extends keyof T>(collName: C, id: RecordId): Promise<T[C]> {
        return this.writeOpsQueue.enqueue(() => {
            return this.deleteOp(collName, id);
        });
    }

    private async transactionOp<S>(cb: (tx: JsonDB<T>) => S | Promise<S>): Promise<S> {
        const dbText = await this.readDbRaw();

        const memAdapter = new Adapters.Memory({ db: dbText });
        const tempDb = new JsonDB<T>({
            ...this.opts,
            adapter: memAdapter,
        });

        const res = await cb(tempDb);

        await this.writeDbRaw(memAdapter.db);

        return res;
    }

    async transaction<S>(cb: (tx: JsonDB<T>) => S | Promise<S>): Promise<S> {
        return this.writeOpsQueue.enqueue(() => {
            return this.transactionOp(cb);
        });
    }

    async clear() {
        const fileContent = await this.loadData();

        for (const collName in fileContent.collections) {
            fileContent.counters[collName] = 0;
            fileContent.collections[collName] = [];
        }

        await this.saveData(fileContent);
    }
}