import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as Store from '../../store/store';
import { TagsBlock } from './tags-block';

const Wrapper = styled.div`

`;
const TagContent = styled.div`
    display: flex;
    align-items: baseline;
    gap: .5em;
    position: relative;

    &:hover {
        /* background-color: rgba(255, 255, 255, .1); */

        .tag-actions-block {
            visibility: visible;
        }
    }
`;
const Bullet = styled.div<{ tag: Store.Tag }>`
    display: inline-block;
    background-color: ${props => props.tag.color || '#fff'};
    width: .75em;
    height: .75em;
    border-radius: 100%;
`;
const TagLabel = styled.span`
    /* background-color: coral; */
    color: hsla(0, 0%, 0%, .9);
    line-height: 1;
    padding: .25em .25em;
    border-radius: .1em;
    display: inline-block;
`;
const TagActionsBlock = styled.span`
    visibility: hidden;
    display: flex;
    align-items: baseline;
    gap: .1em;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
`;

export const TagBlock: React.FC<{ store: Store.Store; tag: Store.Tag; projectName: string }> = observer(({ store, tag, projectName }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const toggleSubTags = () => {
        setIsOpen(!isOpen);
    };
    const isFilteredByTag = !!store.activeTab?.filtering.tagsIds.includes(tag.id);

    return (
        <Wrapper>
            <TagContent>
                {/* <Bullet tag={tag} /> */}
                {/* <span style={{color: 'grey'}}>#{tag.id}</span>
                &nbsp; */}
                <span
                    style={{
                        visibility: tag.children.length > 0 ? 'visible' : 'hidden',
                        fontFamily: 'monospace'
                    }}
                    onClick={() => {
                        toggleSubTags();
                    }}
                >{isOpen ? '-' : '+'}</span>

                &nbsp;

                <TagLabel
                    title={`#${tag.id}`}
                    style={{
                        backgroundColor: tag.color || '#fff',
                        fontWeight: isFilteredByTag ? 'bold' : 'normal'
                    }}
                    onClick={() => {
                        // console.log('rename');
                    }}
                >{tag.name}</TagLabel>
                &nbsp;
                <span style={{ color: 'grey' }}>({tag.files.length} files)</span>
                <TagActionsBlock style={{ marginLeft: 'auto' }} className="tag-actions-block">
                    &nbsp;
                    <button
                        disabled={store.activeTab?.selectedFilePaths.length == 0}
                        onClick={async () => {
                            // console.log('assign to selected files');
                            if (!store.activeTab) return;
                            const selFilePaths = store.activeTab.selectedFilePaths.map(fp => fp.path);;
                            await store.api.files.updateFilesTags(projectName, {
                                filePaths: selFilePaths,
                                addedTagsIds: [tag.id],
                            });
                        }}
                    >+</button>
                    &nbsp;
                    <button
                        disabled={store.activeTab?.selectedFilePaths.length == 0}
                        onClick={async () => {
                            console.log('unassign from selected files');
                            if (!store.activeTab) return;
                            const selFilePaths = store.activeTab.selectedFilePaths.map(fp => fp.path);;
                            await store.api.files.updateFilesTags(projectName, {
                                filePaths: selFilePaths,
                                removedTagsIds: [tag.id],
                            });
                        }}
                    >-</button>
                    &nbsp;
                    <button
                        onClick={() => {
                            // store.createTab({
                            //     filtering: { tagsIds: [tag.id] }
                            // });
                            console.log('open tag config (name, color; delete)')
                        }}
                    >o</button>
                </TagActionsBlock>
            </TagContent>

            {
                tag.children.length > 0 && isOpen
                &&
                <div style={{ paddingLeft: '1em' }}>
                    <TagsBlock store={store} tags={tag.children} projectName={projectName} />
                </div>
            }
        </Wrapper>
    );
});