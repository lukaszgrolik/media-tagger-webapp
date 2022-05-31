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
    background-color: hsla(60, 50%, 50%, .25);
`;

export const SelectionBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <div>{tab.selectedFilePaths.length} files selected</div>

            <div>
                <Button
                    onClick={() => {
                        tab.unselectAllFilePaths();
                    }}
                    disabled={tab.selectedFilePaths.length === 0}
                >unselect</Button>
            </div>
        </Wrapper>
    );
});