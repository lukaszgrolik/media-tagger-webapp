import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import * as Store from '../store/store';

const Wrapper = styled.div`
    background-color: hsl(240, 10%, 90%);
`;
const TabsList = styled.ul`
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
`;
const hoverColor = `hsl(240, 50%, 70%)`;
const TabButton = styled.div<{ isActive: boolean }>`
    ${props => props.isActive === false && css`cursor: pointer`};
    background-color: ${props => props.isActive ? `hsl(240, 10%, 70%)` : ``};
    padding: .5em 1em;

    &:hover {
        ${props => props.isActive === false && css`background-color: ${hoverColor}`};
    }
`;
const AddNewTabButton = styled.div`
    cursor: pointer;
    padding: .5em 1em;

    &:hover {
        background-color: ${hoverColor};
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