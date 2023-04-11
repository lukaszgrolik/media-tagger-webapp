export class ArrayMap<TKey, TArrItem> extends Map<TKey, TArrItem[]> {
    addItem(key: TKey, item: TArrItem): number {
        let arr = this.get(key);
        if (arr === undefined) {
            arr = [];

            this.set(key, arr);
        }

        return arr.push(item);
    }

    filterByKeys(keys: TKey[]): Map<TKey, TArrItem[]> {
        const res = new ArrayMap<TKey, TArrItem>();

        for (const [key, arr] of this) {
            if (keys.includes(key)) {
                res.set(key, arr);
            }
        }

        return res;
    }
}
