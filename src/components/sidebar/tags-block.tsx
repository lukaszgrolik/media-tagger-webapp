import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../../store/store';

export const TagsBlock: React.FC<{ store: Store.Store; tags: Store.Tag[] }> = observer(({ store, tags }) => {
    return (
        <div>
            <ul>
                {
                    tags.slice().sort((a, b) => a.name.localeCompare(b.name)).map(tag => {
                        const isFilteredByTag = store.activeTab.filtering.tagsIds.includes(tag.id);

                        return (
                            <li key={tag.id}>
                                <div>
                                    <span
                                        title={`#${tag.id}`}
                                        style={{ fontWeight: isFilteredByTag ? 'bold' : 'normal' }}
                                        onClick={() => {
                                            store.addTab({
                                                filtering: { tagsIds: [tag.id] }
                                            });
                                        }}
                                    >{tag.name}</span> ({tag.files.length} files)
                                </div>

                                {
                                    tag.children.length > 0
                                    &&
                                    <TagsBlock store={store} tags={tag.children} />
                                }
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
});