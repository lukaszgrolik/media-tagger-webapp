import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import Select from 'react-select';

import * as Store from '../../store/store';
import { TabsBlock } from '../tabs-block';
import { FiltersBlock } from './filters-block';
import { SettingsBlock } from './settings-block';

const Wrapper = styled.div`
    grid-area: top-bar;
`;
const TabsBlockWrapper = styled.div`
    background-color: hsl(240, 10%, 90%);
    padding: .5em;
    padding-bottom: 0;
    font-size: .9em;
`;
const ActiveTabSettingsBlock = styled.div`
    background-color: hsl(240, 10%, 70%);
    font-size: .9em;
`;

export const TopBar: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <TabsBlockWrapper>
                <TabsBlock store={store} />
            </TabsBlockWrapper>

            <ActiveTabSettingsBlock>
                <FiltersBlock store={store} />
                <SettingsBlock store={store} />
            </ActiveTabSettingsBlock>
        </Wrapper>
    );
});