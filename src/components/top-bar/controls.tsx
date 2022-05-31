import styled from '@emotion/styled';

export const Button = styled.button<{ isActive?: boolean }>`
    /* color: hsla(0, 100%, 100%, .75); */
    all: unset;
    /* background: hsl(240, 20%, 50%); */
    background-color: rgba(255, 255, 255, .25);
    color: rgba(255, 255, 255, .75);
    padding: .5em .5em;
    /* border-radius: .25em; */
    font-weight: ${props => props.isActive ? 'bold' : 'normal'};

    &:not([disabled]) {
        cursor: pointer;

        &:hover {
            background-color: rgba(0, 0, 0, .33);
        }
    }
`;