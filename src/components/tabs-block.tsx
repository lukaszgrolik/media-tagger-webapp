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
    align-items: flex-end;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: .25em;
`;
const hoverColor = `hsl(240, 25%, 70%)`;
const TabButton = styled.div<{ isActive: boolean }>`
    /* color: hsla(0, 100%, 100%, .75); */
    padding: .5em 1em;
    border-radius: .25em .25em 0 0;
    display: flex;
    align-items: center;
    justify-items: center;

    ${
        props => props.isActive
        ?
        css`
            background-color: hsl(240, 10%, 70%);
            border-top: 3px solid dodgerblue;
        `
        :
        css`
            cursor: pointer;
            background-color: hsl(240, 10%, 60%);
        `
    };

    &:hover {
        ${props => props.isActive === false && css`background-color: ${hoverColor};`};

        .tab-close-button {
            visibility: visible;
        }
    }
`;
const AddNewTabButton = styled.div`
    cursor: pointer;
    padding: .5em 1em;

    &:hover {
        background-color: ${hoverColor};
    }
`;
const TabCloseButton = styled.div<{ isActive: boolean }>`
    ${props => props.isActive === false && css`visibility: hidden;`}
    cursor: pointer;
    background-color: rgba(0, 0, 0, .1);
    color: rgba(0, 0, 0, .25);
    width: 1em;
    height: 1em;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: rgba(0, 0, 0, 1);
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
                                        tab #{tab.id}

                                        &nbsp;

                                        ({tab.filtering.filePaths.length})

                                        &nbsp;

                                        <TabCloseButton
                                            isActive={store.activeTab === tab}
                                            className="tab-close-button"
                                            onClick={e => {
                                                e.stopPropagation();

                                                console.log('close tab');
                                            }}
                                        >x</TabCloseButton>
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