import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../store/store';
import { TabsBlock } from './tabs-block';

const Wrapper = styled.div`
    grid-area: top-bar;
`;
const SettingsBlock = styled.div`
    background-color: hsl(240, 10%, 70%);
    display: flex;
    padding: 1em;

    > * + * {
        margin-left: 2em;
    }
`;
const TabsBlockWrapper = styled.div`
    background-color: hsl(240, 10%, 90%);
    padding: .5em;
    padding-bottom: 0;
`;

export const TopBar: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <TabsBlockWrapper>
                <TabsBlock store={store} />
            </TabsBlockWrapper>

            <SettingsBlock>
                <div>filtered files: {tab.filtering.filePaths.length} ({store.filePaths.length} total)</div>
                <div style={{ display: 'flex' }}>
                    <div>sort</div>
                    <button
                        style={{ fontWeight: tab.sorting.field === 'path' ? 'bold' : 'normal' }}
                        onClick={() => {
                            tab.sorting.setSorting('path', tab.sorting.asc);
                        }}
                    >path</button>
                    <button
                        style={{ fontWeight: tab.sorting.field === 'mtime' ? 'bold' : 'normal' }}
                        onClick={() => {
                            tab.sorting.setSorting('mtime', tab.sorting.asc);
                        }}
                    >mtime</button>
                    <button
                        style={{ fontWeight: tab.sorting.field === 'size' ? 'bold' : 'normal' }}
                        onClick={() => {
                            tab.sorting.setSorting('size', tab.sorting.asc);
                        }}
                    >size</button>
                    <button
                        onClick={() => {
                            tab.sorting.setSorting(tab.sorting.field, !tab.sorting.asc);
                        }}
                    >{tab.sorting.asc ? 'asc' : 'desc'}</button>
                </div>
                <div style={{ display: 'flex' }}>
                    <button
                        disabled={tab.pagination.isFirstPage}
                        onClick={() => {
                            tab.pagination.goToPrevPage();
                        }}
                    >prev</button>
                    {/* <div>1 2 3 ... 8 (9) 10 ... 56 57 58</div> */}
                    <form style={{ display: 'flex' }}>
                        <div>go to page:</div>
                        <input
                            style={{ width: `${tab.pagination.pagesCount.toString().length + 2}em`, fontFamily: 'monospace' }}
                            type="number"
                            value={tab.pagination.currentPage}
                            onChange={e => {
                                tab.pagination.setCurrentPage(e.currentTarget.valueAsNumber);
                            }}
                        />
                    </form>
                    <div> / {tab.pagination.pagesCount}</div>
                    <button
                        disabled={tab.pagination.isLastPage}
                        onClick={() => {
                            tab.pagination.goToNextPage();
                        }}
                    >next</button>
                    <form style={{ display: 'flex' }}>
                        <div>per page</div>
                        <input
                            style={{ width: `${3 + 2}em`, fontFamily: 'monospace' }}
                            type="number"
                            value={tab.pagination.perPage}
                            onChange={e => {
                                tab.pagination.setPerPage(e.currentTarget.valueAsNumber);
                            }}
                        />
                    </form>
                </div>
                <form style={{ display: 'flex' }}>
                    <div>max height</div>
                    <input
                        style={{ width: `${3 + 2}em`, fontFamily: 'monospace' }}
                        type="number"
                        value={tab.config.fileHeight}
                        onChange={e => {
                            tab.config.setFileHeight(e.currentTarget.valueAsNumber);
                        }}
                    />
                    <input
                        type="range"
                        min={100}
                        max={700}
                        step={25}
                        value={tab.config.fileHeight}
                        onChange={e => {
                            tab.config.setFileHeight(e.currentTarget.valueAsNumber);
                        }}
                    />
                </form>

                <div style={{ display: 'flex' }}>
                    <div>{tab.selectedFilePaths.length} files selected</div>

                    <div>
                        <button
                            onClick={() => {
                                tab.unselectAllFilePaths();
                            }}
                            disabled={tab.selectedFilePaths.length === 0}
                        >unselect</button>
                    </div>
                </div>
            </SettingsBlock>
        </Wrapper>
    );
});