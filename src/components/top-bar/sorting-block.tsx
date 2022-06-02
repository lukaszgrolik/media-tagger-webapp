import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import Select from 'react-select';

import * as Store from '../../store/store';
import { Button } from './controls';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 0 1em;
    background-color: hsla(0, 50%, 50%, .25);
`;

export const SortingBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <div>sort</div>

            <Button
                isActive={tab.sorting.field === 'path'}
                onClick={() => {
                    tab.sorting.setSorting('path', tab.sorting.asc);
                }}
            >path</Button>

            <Button
                isActive={tab.sorting.field === 'mtime'}
                onClick={() => {
                    tab.sorting.setSorting('mtime', tab.sorting.asc);
                }}
            >mtime</Button>

            <Button
                isActive={tab.sorting.field === 'fileSize'}
                onClick={() => {
                    tab.sorting.setSorting('fileSize', tab.sorting.asc);
                }}
            >size</Button>

            <Button
                onClick={() => {
                    tab.sorting.setSorting(tab.sorting.field, !tab.sorting.asc);
                }}
            >{tab.sorting.asc ? 'asc' : 'desc'}</Button>
        </Wrapper>
    );
});