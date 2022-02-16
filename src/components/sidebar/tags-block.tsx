import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../../store/store';
import { TagBlock } from './tag-block';

export const TagsBlock: React.FC<{ store: Store.Store; tags: Store.Tag[]; projectName: string }> = observer(({ store, tags, projectName }) => {
    return (
        <div>
            <ul style={{padding: 0, listStyle: 'none', margin: 0}}>
                {
                    tags.slice().sort((a, b) => a.name.localeCompare(b.name)).map(tag => {
                        return (
                            <li key={tag.id}>
                                <TagBlock store={store} projectName={projectName} tag={tag} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
});