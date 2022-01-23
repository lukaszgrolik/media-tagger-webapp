import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import * as Store from '../store/store';

const Wrapper = styled.div`

`;
const TabsList = styled.ul`
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
`;
const TabButton = styled.div<{ isActive: boolean }>`
    ${props => props.isActive === false && css`cursor: pointer`};
    background-color: ${props => props.isActive ? `rgba(255, 255, 255, .5)` : `rgba(0, 0, 0, .1)`};
    padding: .5em 1em;

    &:hover {
        ${props => props.isActive === false && css`background-color: rgba(255, 255, 255, .1)`};
    }
`;
const AddNewTabButton = styled.div`
    cursor: pointer;
    padding: .5em 1em;

    &:hover {
        background-color: rgba(255, 255, 255, .25);
    }
`;
export const TabsBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    return (
        <Wrapper>
            <div>
                <TabsList>
                    {
                        // ['gallery', 'gallery', 'list']
                        store.tabs.map((tab, i) => {
                            return (
                                <li key={i}>
                                    <TabButton
                                        isActive={store.activeTab === tab}
                                        onClick={async () => {
                                            if (store.activeTab !== tab) {
                                                await store.updateProject({
                                                    activeTabId: tab.id,
                                                });
                                            }
                                        }}
                                    >
                                        tab #{tab.id} ({tab.filtering.filePaths.length})
                                    </TabButton>
                                </li>
                            );
                        })

                    }

                    <li>
                        <AddNewTabButton
                            onClick={() => {
                                store.createEmptyTab();
                            }}
                        >+add</AddNewTabButton>
                    </li>
                </TabsList>
            </div>
        </Wrapper>
    );
});