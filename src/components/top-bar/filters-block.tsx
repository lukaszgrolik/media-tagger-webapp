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
    /* justify-items: center; */
    gap: 2em;
    padding: 0 1em;
`;

export const FiltersBlock: React.FC<{ store: Store.Store }> = observer(({ store }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    return (
        <Wrapper>
            <div>filtered files: {tab.filtering.filePaths.length} ({store.filePaths.length} total)</div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '.5em', padding: '.5em' }}>
                <input
                    type="checkbox"
                    checked={tab.filtering.untagged}
                    onChange={e => {
                        tab.filtering.setUntagged(e.currentTarget.checked);
                    }}
                />
                <div>untagged only</div>
            </label>

            <div>
                <span>filter tags:</span>
                {/* {tab.filtering.tags.map(tag => tag.name).join(', ') || '-'} */}
                <Select
                    isMulti={true}
                    value={tab.filtering.tags}
                    options={store.tags.slice().sort((a, b) => a.pathString.localeCompare(b.pathString))}
                    getOptionValue={tag => tag.id.toString()}
                    getOptionLabel={tag => tag.pathString}
                    onChange={tags => {
                        const tagsIds = tags.map(t => t.id);
                        store.activeTab?.filtering.setTags(tagsIds);
                    }}
                />
            </div>

            <div>
                <span>omit tags:</span> {tab.filtering.withoutTags.map(tag => tag.name).join(', ') || '-'}
                <Select
                    isMulti={true}
                    value={tab.filtering.withoutTags}
                    options={store.tags.slice().sort((a, b) => a.pathString.localeCompare(b.pathString))}
                    getOptionValue={tag => tag.id.toString()}
                    getOptionLabel={tag => tag.pathString}
                    onChange={tags => {
                        const tagsIds = tags.map(t => t.id);
                        store.activeTab?.filtering.setWithoutTags(tagsIds);
                    }}
                />
            </div>
        </Wrapper>
    );
});