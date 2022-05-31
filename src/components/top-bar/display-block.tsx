import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import Select from 'react-select';

import * as Store from '../../store/store';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 0 1em;
    margin-left: auto;
    background-color: hsla(240, 50%, 50%, .25);
`;

export const DisplayBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
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
                style={{ width: 100 }}
                onChange={e => {
                    tab.config.setFileHeight(e.currentTarget.valueAsNumber);
                }}
            />
        </Wrapper>
    );
});