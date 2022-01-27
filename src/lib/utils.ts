export const repLinGradient = (deg: number, colorA: string, colorB: string, widthA: string | number, widthB: string | number) => {
    return `repeating-linear-gradient(
    ${deg}deg,
    ${colorA},
    ${colorA} ${widthA},
    ${colorB} ${widthA},
    ${colorB} ${widthB}
)`;
};