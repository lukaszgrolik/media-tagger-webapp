import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { FilePath } from '../../store/file-path';

const Wrapper = styled.div`
    grid-area: main-content;
    overflow: auto;
    padding: 2em;
`;
const MediaList = styled.ul<{ width: number; height: number }>`
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

    li {
        list-style: none;
        margin: 1em 0 0 1em;
    }
`;

export const MediaItem: React.FC<{ store: Store.Store; projectName: string; filePath: FilePath }> = observer(({ store, projectName, filePath }) => {
    const tab = store.activeTab;
    const assetUrl = store.api.getProjectFileUrl(projectName, filePath.path);
    const thumbnailUrl = (() => {
        const thumbSizes = [90, 180, 360, 720];
        const { fileHeight } = tab.config;

        if (filePath.fileExt === 'gif') {
            return assetUrl;
        }
        else if (fileHeight > thumbSizes[thumbSizes.length - 1]) {
            return assetUrl;
        }
        else {
            const thumbSize = thumbSizes.find(s => s >= fileHeight) as number;

            return store.api.getProjectFileThumbnailUrl(projectName, filePath.path, thumbSize);
        }
    })();

    return (
        <div style={{ position: 'relative' }}>
            <div title={filePath.mtime}>
                {
                    filePath.fileType === 'video'
                        ?
                        <video
                            width={tab.config.fileHeight * 16 / 9}
                            height={tab.config.fileHeight}
                            controls
                            preload="none"
                            style={{ display: 'block', backgroundColor: 'black' }}
                        >
                            <source src={assetUrl} type="video/mp4" />
                        </video>
                        :
                        filePath.fileType === 'image'
                            ?
                            <img
                                // src={thumbnailUrl}
                                src={assetUrl}
                                alt={filePath.path}
                                // width={tab.config.fileWidth}
                                height={tab.config.fileHeight}
                                style={{ display: 'block' }}
                                loading="lazy"
                            />
                            :
                            <div>
                                <div>{assetUrl}</div>
                                <div>unsupported file extension:  {filePath.fileExt}</div>
                            </div>
                }
            </div>

            <div style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14 }}>
                <a href={assetUrl} title={filePath.path}>link</a>
            </div>

            <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14 }}>
                {filePath.sizeString}
            </div>

            {
                filePath.file
                &&
                <div style={{ position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14 }}>#{filePath.file.id}</div>
            }

            {
                filePath.file?.tags.length
                &&
                <div style={{ position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14 }}>
                    <span title={`${filePath.file.tags.map(t => t.pathString).join('\n')}`}>{filePath.file.tags.length} tags</span>
                </div>
            }
        </div>
    );
});