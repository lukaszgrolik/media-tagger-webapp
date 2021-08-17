interface Tag {
    id: number;
    name: string;
    parentId: null | number;
}

interface File {
    // folderPath: string;
    // fileId: string;
    path: string;
    description: string;
    // fav: boolean;
    tagsIds: number[];
}

interface FileParserResult {
    tags: Tag[];
    files: File[];
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

        const [_a, folderPath, _b, fileId, restStr] = m;
        const getFilePath = () => {
            // file name format: MOV_0023.mp4
            const fileNumber = `${new Array(4 - fileId.length).fill('0').join('')}${fileId}`;

            return `/${folderPath}/MOV_${fileNumber}.mp4`;
        };
        const file: File = {
            path: getFilePath(),
            description: '',
            // fav: false,
            tagsIds: [],
        };

        if (restStr) {
            const [tagStr, descStr] = (() => {
                const restM = restStr.match(/#\{opis\}(.+)$/);
                if (!restM) return [restStr, ''];
                const [descWrapperStr, descStr] = restM;

                return [
                    restStr.replace(descWrapperStr, ''),
                    descStr,
                ];
            })();

            file.description = descStr.trim();

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

                file.tagsIds.push(foundTag2.id);
            }
        }

        resData.files.push(file)
    });

    // console.log(resData.tags.slice().sort((a, b) => a.name.localeCompare(b.name)));

    return resData;

};