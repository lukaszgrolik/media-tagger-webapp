interface Tag {
    id: number;
    name: string;
    parentId: null | number;
}

interface FileParserResult {
    tags: Tag[];
    files: {
        folderPath: string;
        fileId: string;
        description: string;
        fav: boolean;
        tagsIds: number[];
    }[];
}

export const parseFile = (dataStr: string): FileParserResult => {

    function parseTagString(str: string) {
        const cats = str.trim().replace(/\[|\{| "| '/g, x => `\n${x}`).split('\n').filter(x => x).map(l => l.trim());
        const resData = [];
        // console.log(cats)

        for (const catStr of cats) {
            const m = catStr.match(/^(\[|\{|"|')(.+)(\]|\}|"|')(.+)$/);
            if (!m) throw new Error(`invalid tags string: "${catStr}"`);

            const [_, _x, catName, _y, tagsStr] = m;
            const tags = tagsStr.trim().split(',').map(x => x.trim());

            for (const tag of tags) {
                resData.push([catName, tag]);
            }
        }

        return resData;
    }

    const lines = dataStr.split('\n').filter(l => l)
    const resData: FileParserResult = { tags: [], files: [] };

    lines.forEach(line => {
        const m = line.match(/^(\d{4}-\d{2}-\d{2}(.+)?) \| (\d{2,3}) \|(.+)?$/);
        if (!m) throw new Error(`invalid line: ${line}`);

        const [_a, folderPath, _b, fileId, tagStr] = m;

        if (tagStr) {
            //console.log(tagStr);
            const tags = parseTagString(tagStr);

            for (const tagPair of tags) {
                let foundTag1 = resData.tags.find(t => t.name === tagPair[0]);
                if (!foundTag1) {
                    foundTag1 = { id: resData.tags.length + 1, name: tagPair[0], parentId: null };
                    resData.tags.push(foundTag1);
                }

                let foundTag2 = resData.tags.find(t => {
                    return t.name === tagPair[1] && t.parentId === (foundTag1 as Tag).id;
                });
                if (!foundTag2) {
                    foundTag2 = { id: resData.tags.length + 1, name: tagPair[1], parentId: foundTag1.id };
                    resData.tags.push(foundTag2);
                }
            }
        }

        resData.files.push({
            folderPath,
            fileId,
            description: '',
            fav: false,
            tagsIds: [],
        })
    });

    // console.log(resData.tags.slice().sort((a, b) => a.name.localeCompare(b.name)));

    return resData;

};