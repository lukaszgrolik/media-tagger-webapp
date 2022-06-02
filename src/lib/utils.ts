export const repLinGradient = (deg: number, colorA: string, colorB: string, widthA: string | number, widthB: string | number) => {
    return `repeating-linear-gradient(
    ${deg}deg,
    ${colorA},
    ${colorA} ${widthA},
    ${colorB} ${widthA},
    ${colorB} ${widthB}
)`;
};

// https://stackoverflow.com/a/14919494
export function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}