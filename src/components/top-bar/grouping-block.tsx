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
    background-color: hsla(270, 50%, 50%, .25);
`;

export const GroupingBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <div>group</div>

            <Button
                isActive={tab.grouping.mode === null}
                onClick={() => {
                    tab.grouping.setMode(null);
                }}
            >none</Button>

            <Button
                isActive={tab.grouping.mode === 'day'}
                onClick={() => {
                    tab.grouping.setMode('day');
                }}
            >day</Button>

            <Button
                isActive={tab.grouping.mode === 'month'}
                onClick={() => {
                    tab.grouping.setMode('month');
                }}
            >month</Button>
        </Wrapper>
    );
});