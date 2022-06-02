import styled from '@emotion/styled';

export const MediaList = styled.ul<{width: number; height: number}>`
    margin: 0;
    padding: 2em;

    /* display: grid; */
    /* grid-template-columns: ${(props) => `repeat(3, ${props.width}px)`}; */
    /* grid-template-columns: ${(props) => `repeat(auto-fit, minmax(${props.width}px, 1fr))`}; */
    /* grid-auto-rows: ${props => `${props.height}px`}; */
    /* grid-gap: 1em 1em; */

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: -1em 0 0 -1em;

    > li {
        list-style: none;
        margin: 1em 0 0 1em;
    }
`;