import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../../store/store';

const Bullet = styled.div<{tag: Store.Tag}>`
    display: inline-block;
    background-color: ${props => props.tag.color || '#fff'};
    width: .75em;
    height: .75em;
    border-radius: 100%;
`;

export const TagsBlock: React.FC<{ store: Store.Store; tags: Store.Tag[] }> = observer(({ store, tags }) => {
    return (
        <div>
            <ul style={{padding: 0, listStyle: 'none', margin: 0}}>
                {
                    tags.slice().sort((a, b) => a.name.localeCompare(b.name)).map(tag => {
                        const isFilteredByTag = !!store.activeTab?.filtering.tagsIds.includes(tag.id);

                        return (
                            <li key={tag.id}>
                                <div>
                                    <Bullet tag={tag} />
                                    <span style={{color: 'grey'}}>#{tag.id}</span> <span
                                        title={`#${tag.id}`}
                                        style={{ fontWeight: isFilteredByTag ? 'bold' : 'normal' }}
                                        onClick={() => {
                                            store.createTab({
                                                filtering: { tagsIds: [tag.id] }
                                            });
                                        }}
                                    >{tag.name}</span> <span style={{color: 'grey'}}>({tag.files.length} files)</span>
                                </div>

                                {
                                    tag.children.length > 0
                                    &&
                                    <div style={{paddingLeft: '1em'}}>
                                        <TagsBlock store={store} tags={tag.children} />
                                    </div>
                                }
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
});