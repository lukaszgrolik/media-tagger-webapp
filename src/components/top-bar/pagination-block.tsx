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
    background-color: hsla(120, 50%, 50%, .25);
`;

export const PaginationBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
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
        </Wrapper>
    );
});