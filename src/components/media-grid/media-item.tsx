import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from '../../lib/file-parser';
import * as Store from '../../store/store';
import { FilePath } from '../../store/file-path';
import { TagsList } from './tags-list';

const Wrapper = styled.div`

`;

export const MediaItem: React.FC<{ store: Store.Store; projectName: string; filePath: FilePath }> = observer(({ store, projectName, filePath }) => {
    const tab = store.activeTab;
    if (!tab) return null;

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
    const posterUrl = (() => {
        if (!filePath.file || !filePath.file.meta.poster) return;

        const url = store.api.getProjectFilePosterUrl(projectName, filePath.file.meta.poster);

        return url;
    })();
    const isSelected = tab.selectedFilePaths.includes(filePath);

    return (
        <div>
            <div
                style={{
                    position: 'relative',
                    outline: isSelected ? '5px solid tomato' : ''
                }}
                onClick={() => {
                    tab.toggleFilePath(filePath);
                }}
            >
                <div title={filePath.file?.mtimeDate?.toFormat('yyyy-MM-dd HH:mm')}>
                    {
                        filePath.fileType === 'video'
                            ?
                            <video
                                width={tab.config.fileHeight * 16 / 9}
                                height={tab.config.fileHeight}
                                controls
                                muted={true}
                                preload="none"
                                poster={posterUrl}
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
                    {filePath.file?.fileSizeString}
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

            {/* <div style={{backgroundColor: '#fff'}}> */}
            <div style={{marginTop: '.5em'}}>
                <TagsList store={store} filePath={filePath} />
            </div>
        </div>
    );
});