import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { DateTime } from 'luxon';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { MediaItem } from './media-item';
import { repLinGradient } from '../../lib/utils';
import { FilePath } from '../../store/file-path';
import { MediaList } from './media-list';
import { GroupingMode } from '../../store/tab/grouping';

const Wrapper = styled.div`

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

const groupFound = (mode: GroupingMode, dateA: DateTime, dateB: DateTime) => {
    // console.log('dateA', dateA, 'dateB', dateB)
    if (mode === 'day') {
        // return dateA.year == dateB.year && dateA.month == dateB.month && dateA.day == dateB.day
        return dateA.hasSame(dateB, 'day');
    }
    else if (mode === 'month') {
        // return dateA.year == dateB.year && dateA.month == dateB.month;
        return dateA.hasSame(dateB, 'month');
    }
    else {
        return false;
    }
};
const dateToString = (mode: GroupingMode, date: DateTime) => {
    if (mode === 'day') {
        // return `${date.year}-${date.month}-${date.day}`;
        return date.toFormat('yyyy-MM-dd');
    }
    else if (mode === 'month') {
        // return `${date.year}-${date.month}`;
        return date.toFormat('yyyy-MM');
    }
    else {
        return '';
    }
};

export const MediaGroupedList: React.FC<{ store: Store.Store; projectName: string; }> = observer(({ store, projectName }) => {
    const tab = store.activeTab;
    if (!tab) return null;

    const groups = tab.pagination.filePaths.reduce((memo: { date: DateTime | null, filePaths: FilePath[] }[], fp) => {
        let dateFound = memo.find(day => {
            if (!day.date || !fp.file || !fp.file.mtimeDate) return false;

            return groupFound(tab.grouping.mode, day.date, fp.file.mtimeDate);
        });

        if (!dateFound) {
            dateFound = {
                date: fp.file?.mtimeDate || null,
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
                        const groupTitle = group.date ? dateToString(tab.grouping.mode, group.date) : '<none>';

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