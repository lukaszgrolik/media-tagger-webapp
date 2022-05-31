import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import Select from 'react-select';

import * as Store from '../../store/store';
import { SortingBlock } from './sorting-block';
import { PaginationBlock } from './pagination-block';
import { DisplayBlock } from './display-block';
import { SelectionBlock } from './selection-block';
import { GroupingBlock } from './grouping-block';

const Wrapper = styled.div`
    background-color: rgba(0, 0, 0, .1);
    display: flex;
    /* align-items: center; */
    justify-items: center;
    /* padding: .5em; */
    gap: 2em;
`;

export const SettingsBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <SortingBlock store={store} />
            <PaginationBlock store={store} />
            <GroupingBlock store={store} />
            <DisplayBlock store={store} />
            <SelectionBlock store={store} />
        </Wrapper>
    );
});