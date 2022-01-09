import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { GlobalUtils } from '../../lib/global-utils';
import { MediaItem } from './media-item';

const Wrapper = styled.div`
    grid-area: main-content;
    overflow: auto;
    padding: 2em;
`;
const MediaList = styled.ul<{width: number; height: number}>`
    margin: 0;
    padding: 0;

    /* display: grid; */
    /* grid-template-columns: ${(props) => `repeat(3, ${props.width}px)`}; */
    /* grid-template-columns: ${(props) => `repeat(auto-fit, minmax(${props.width}px, 1fr))`}; */
    /* grid-auto-rows: ${props => `${props.height}px`}; */
    /* grid-gap: 1em 1em; */

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: -1em 0 0 -1em;

    li {
        list-style: none;
        margin: 1em 0 0 1em;
    }
`;

export const MediaGrid: React.FC<{ store: Store.Store; projectName: string; }> = observer(({store, projectName}) => {
    const tab = store.activeTab;

    return (
        <Wrapper>
            <MediaList width={tab.config.fileWidth} height={tab.config.fileHeight}>
                {
                    tab.pagination.filePaths.map(filePath => {
                        return (
                            <li key={filePath.path}>
                               <MediaItem store={store} projectName={projectName} filePath={filePath} />
                            </li>
                        );
                    })
                }
            </MediaList>
        </Wrapper>
    );
});