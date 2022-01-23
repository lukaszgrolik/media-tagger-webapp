import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../../store/store';
import { TagsBlock } from './tags-block';

const Wrapper = styled.div`
    background-color: hsl(240, 15%, 15%);
    color: #fff;
    grid-area: side-bar;
    overflow: auto;
    font-size: 14px;
`;
const TagsBlockWrapper = styled.div`
    padding: 1em;
`;

export const Sidebar: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const taggedFiles = store.files.filter(f => f.tagsIds.length !== 0);
    const nonTaggedFiles = store.files.filter(f => f.tagsIds.length === 0);
    const filesWithDescription = store.files.filter(f => f.description);
    const tab = store.activeTab;

    return (
        <Wrapper>
            <div>
                <ul>
                    <li>all files: {store.files.length}</li>
                    <li>files w tags: {taggedFiles.length} </li>
                    <li>files with no tags: {nonTaggedFiles.length}</li>
                    <li>files w desc: {filesWithDescription.length}</li>
                </ul>
            </div>

            <div>
                all tags: {store.tags.length}
            </div>

            <TagsBlockWrapper>
                <TagsBlock store={store} tags={store.topLevelTags} />
            </TagsBlockWrapper>
        </Wrapper>
    );
});