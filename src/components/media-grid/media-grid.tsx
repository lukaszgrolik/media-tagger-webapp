import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { MediaItem } from './media-item';
import { repLinGradient } from '../../lib/utils';
import { FilePath } from '../../store/file-path';
import { MediaGroupedList } from './media-grouped-list';
import { MediaList } from './media-list';

const Wrapper = styled.div`
    /* background: #000; */
    /* background: ${repLinGradient(-45, '#373737', '#333', `1em`, `5em`)}; */
    background: ${repLinGradient(-45, '#f7f7f7', '#eee', `1em`, `5em`)};
    grid-area: main-content;
    overflow: auto;
    padding: 2em;
`;

export const MediaGrid: React.FC<{ store: Store.Store; projectName: string; }> = observer(({store, projectName}) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            {
                tab.grouping.mode === null
                    ?
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
                    :
                    <MediaGroupedList store={store} projectName={projectName} />
            }
        </Wrapper>
    );
});