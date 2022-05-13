import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { MediaItem } from './media-item';
import { repLinGradient } from '../../lib/utils';
import { DateObj, FilePath } from '../../store/file-path';

const Wrapper = styled.div`
    /* background: #000; */
    /* background: ${repLinGradient(-45, '#373737', '#333', `1em`, `5em`)}; */
    background: ${repLinGradient(-45, '#f7f7f7', '#eee', `1em`, `5em`)};
    grid-area: main-content;
    overflow: auto;
    padding: 2em;
`;
const GroupsList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;
const GroupHeader = styled.div`
    text-align: center;
    font-size: 1.5em;
    padding: .5em 0;
    margin: 1.5em 0;
    border-bottom: 1px solid rgba(0, 0, 0, .1);
`;
const MediaList = styled.ul<{width: number; height: number}>`
    margin: 0;
    padding: 0;

    /* display: grid; */
    /* grid-template-columns: ${(props) => `repeat(3, ${props.width}px)`}; */
    /* grid-template-columns: ${(props) => `repeat(auto-fit, minmax(${props.width}px, 1fr))`}; */
    /* grid-auto-rows: ${props => `${props.height}px`}; */
    /* grid-gap: 1em 1em; */

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: -1em 0 0 -1em;

    > li {
        list-style: none;
        margin: 1em 0 0 1em;
    }
`;

export const MediaGrid: React.FC<{ store: Store.Store; projectName: string; }> = observer(({store, projectName}) => {
    const tab = store.activeTab;
    if (!tab) return null;

    let mode: 'DAY' | 'MONTH' = 'MONTH';

    const groupFound = (dateA: DateObj, dateB: DateObj) => {
        if (mode === 'DAY') {
            return dateA.year == dateB.year && dateA.month == dateB.month && dateA.day == dateB.day
        }
        else if (mode === 'MONTH') {
            return dateA.year == dateB.year && dateA.month == dateB.month;
        }
        else {
            return false;
        }
    };
    const dateToString = (date: DateObj) => {
        if (mode === 'DAY') {
            return `${date.year}-${date.month}-${date.day}`;
        }
        else if (mode === 'MONTH') {
            return `${date.year}-${date.month}`;
        }
        else {
            return '';
        }
    };

    const groups = tab.pagination.filePaths.reduce((memo: {date: DateObj | null, filePaths: FilePath[]}[], fp) => {
        let dateFound = memo.find(day => (!day.date || !fp.mtimeDate) ? false : groupFound(day.date, fp.mtimeDate));

        if (!dateFound) {
            dateFound = {
                date: fp.mtimeDate,
                filePaths: [],
            };

            memo.push(dateFound);
        }

        dateFound.filePaths.push(fp);

        return memo;
    }, []);

    return (
        <Wrapper>
            <ul>
                {
                    groups.map(group => {
                        var groupTitle = group.date ? dateToString(group.date) : '<none>';

                        return (
                            <GroupsList key={groupTitle}>
                                <div>
                                    <GroupHeader>{groupTitle}</GroupHeader>

                                    <div>
                                        <MediaList width={tab.config.fileWidth} height={tab.config.fileHeight}>
                                            {
                                                // tab.pagination.filePaths.map(filePath => {
                                                group.filePaths.map(filePath => {
                                                    return (
                                                        <li key={filePath.path}>
                                                            <MediaItem store={store} projectName={projectName} filePath={filePath} />
                                                        </li>
                                                    );
                                                })
                                            }
                                        </MediaList>
                                    </div>
                                </div>
                            </GroupsList>
                        )
                    })
                }
            </ul>
        </Wrapper>
    );
});