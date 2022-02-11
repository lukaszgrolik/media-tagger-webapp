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
const FiltersBlock = styled.div`
    display: flex;
    align-items: center;
    /* justify-items: center; */
    gap: 2em;
    padding: 0 1em;
`;
const SettingsBlock = styled.div`
    background-color: rgba(0, 0, 0, .1);
    display: flex;
    /* align-items: center; */
    justify-items: center;
    /* padding: .5em; */
    gap: 2em;
`;
const Button = styled.button`
    /* color: hsla(0, 100%, 100%, .75); */
    all: unset;
    /* background: hsl(240, 20%, 50%); */
    background-color: rgba(255, 255, 255, .25);
    color: rgba(255, 255, 255, .75);
    padding: .5em .5em;
    /* border-radius: .25em; */

    &:not([disabled]) {
        cursor: pointer;

        &:hover {
            background-color: rgba(0, 0, 0, .33);
        }
    }
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
                <FiltersBlock>
                    <div>filtered files: {tab.filtering.filePaths.length} ({store.filePaths.length} total)</div>

                    <label style={{display: 'flex', alignItems: 'center', gap: '.5em', padding: '.5em'}}>
                        <input
                            type="checkbox"
                            checked={tab.filtering.untagged}
                            onChange={e => {
                                tab.filtering.setUntagged(e.currentTarget.checked);
                            }}
                        />
                        <div>untagged only</div>
                    </label>

                    <div>filter tags: {tab.filtering.tags.map(tag => tag.name).join(', ') || '-'}</div>

                    <div>omit tags: {tab.filtering.withoutTags.map(tag => tag.name).join(', ') || '-'}</div>

                </FiltersBlock>

                <SettingsBlock>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em', padding: `0 1em`, backgroundColor: `hsla(0, 50%, 50%, .25)` }}>
                        <div>sort</div>

                        <Button
                            style={{ fontWeight: tab.sorting.field === 'path' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('path', tab.sorting.asc);
                            }}
                        >path</Button>

                        <Button
                            style={{ fontWeight: tab.sorting.field === 'mtime' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('mtime', tab.sorting.asc);
                            }}
                        >mtime</Button>

                        <Button
                            style={{ fontWeight: tab.sorting.field === 'size' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('size', tab.sorting.asc);
                            }}
                        >size</Button>

                        <Button
                            onClick={() => {
                                tab.sorting.setSorting(tab.sorting.field, !tab.sorting.asc);
                            }}
                        >{tab.sorting.asc ? 'asc' : 'desc'}</Button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em', padding: `0 1em`, backgroundColor: `hsla(120, 50%, 50%, .25)` }}>
                        <Button
                            disabled={tab.pagination.isFirstPage}
                            onClick={() => {
                                tab.pagination.goToPrevPage();
                            }}
                        >prev</Button>

                        {/* <div>1 2 3 ... 8 (9) 10 ... 56 57 58</div> */}
                        <form
                            style={{ display: 'flex', alignItems: 'baseline' }}
                            onSubmit={e => {
                                e.preventDefault();
                            }}
                        >
                            <div>go to page:</div>

                            <input
                                style={{ width: `${tab.pagination.pagesCount.toString().length + 2}em`, fontFamily: 'monospace' }}
                                type="number"
                                value={tab.pagination.currentPage}
                                onChange={e => {
                                    tab.pagination.setCurrentPage(e.currentTarget.valueAsNumber);
                                }}
                            />

                            <div>&nbsp;/ {tab.pagination.pagesCount}</div>
                        </form>

                        <Button
                            disabled={tab.pagination.isLastPage}
                            onClick={() => {
                                tab.pagination.goToNextPage();
                            }}
                        >next</Button>

                        <form style={{ display: 'flex', alignItems: 'baseline' }}>
                            <input
                                style={{ width: `${3 + 2}em`, fontFamily: 'monospace' }}
                                type="number"
                                value={tab.pagination.perPage}
                                onChange={e => {
                                    tab.pagination.setPerPage(e.currentTarget.valueAsNumber);
                                }}
                            />

                            <div>&nbsp;per page</div>
                        </form>
                    </div>

                    <form style={{ display: 'flex', alignItems: 'center', gap: '1em', padding: `0 1em`, marginLeft: 'auto', backgroundColor: `hsla(240, 50%, 50%, .25)` }}>
                        <div>height</div>

                        <input
                            style={{ width: `${3 + 2}em`, fontFamily: 'monospace' }}
                            type="number"
                            step={25}
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
                            style={{width: 100}}
                            onChange={e => {
                                tab.config.setFileHeight(e.currentTarget.valueAsNumber);
                            }}
                        />
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em', padding: `0 1em`, backgroundColor: `hsla(60, 50%, 50%, .25)` }}>
                        <div>{tab.selectedFilePaths.length} files selected</div>

                        <div>
                            <Button
                                onClick={() => {
                                    tab.unselectAllFilePaths();
                                }}
                                disabled={tab.selectedFilePaths.length === 0}
                            >unselect</Button>
                        </div>
                    </div>
                </SettingsBlock>
            </ActiveTabSettingsBlock>
        </Wrapper>
    );
});