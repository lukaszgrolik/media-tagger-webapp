import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { FilePath } from '../../store/file-path';

const Wrapper = styled.div`
    /* padding: .5em; */
    font-size: .8em;
`;
const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;

    margin-top: -.5em;
    margin-left: -.5em;

    > li {
        margin-top: .5em;
        margin-left: .5em;
    }
`;
const TagBlock = styled.div`
    /* background-color: coral; */
    color: hsla(0, 0%, 0%, .9);
    padding: .1em .25em;
    border-radius: .1em;
`;

export const TagsList: React.FC<{ store: Store.Store; filePath: FilePath }> = observer(({ store, filePath }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    const isSelected = tab.selectedFilePaths.includes(filePath);
    const hues = [0, 60, 120, 180, 240, 300];

    return (
        <Wrapper>
            <List>
                {
                    filePath.file?.tags.map(tag => {
                        // const index = Math.floor(Math.random() * hues.length);
                        // const hue = hues[index];
                        // const color = `hsl(${hue}, 50%, 50%)`;
                        const color = tag.color || '#fff';

                        return (
                            <li key={tag.id}>
                                <TagBlock
                                    style={{backgroundColor: color}}
                                >{tag.name}</TagBlock>
                            </li>
                        );
                    })
                }
            </List>
        </Wrapper>
    );
});