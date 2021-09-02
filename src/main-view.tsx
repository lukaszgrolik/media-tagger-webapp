import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from './file-parser';
import * as Store from './store/store';

declare var TAGS_FILE: string;
declare var window: {loadProject: (...args: any[]) => any}

const Wrapper = styled.div`
    /* padding: 2em;
    display: flex;

    > * + * {
        margin-left: 2em;
    } */

    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: minmax(auto, 15%) 1fr;
    grid-template-areas:
        "side-bar top-bar"
        "side-bar main-content";
    height: 100vh;
    overflow: hidden;
`;
const Sidebar = styled.div`
    grid-area: side-bar;
    overflow: auto;
    font-size: 14px;
`;
const TopBar = styled.div`
    background-color: #eee;
    grid-area: top-bar;
    padding: 2em;
`;
const SettingsBlock = styled.div`
    display: flex;

    > * + * {
        margin-left: 2em;
    }
`;
const MainContent = styled.div`
    grid-area: main-content;
    overflow: auto;
    padding: 2em;
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

    li {
        list-style: none;
        margin: 1em 0 0 1em;
    }
`;

const fetchProjects = async (store: Store.Store) => {
    // const projects = await store.api.fetchProjects();

    // store.setProjects(projects);
};
// const TEMP_PROJECT_NAME = 'records';
const loadProject = async (projectName: string, store: Store.Store) => {
    await Promise.all([
        fetchFiles(projectName, store),
        fetchDB(projectName, store),
    ]);
};
window.loadProject = loadProject;
const fetchFiles = async (projectName: string, store: Store.Store) => {
    const files = await store.api.fetchFilePaths(projectName);

    store.setFilePaths(files);
};
const fetchDB = async (projectName: string, store: Store.Store) => {
    // const parsedFileData = fileParser.parseFile(TAGS_FILE);
    // console.log('parsedFileData', parsedFileData)

    // store.setTags(parsedFileData.tags);
    // store.setFiles(parsedFileData.files);

    const db = await store.api.fetchDB(projectName);

    store.setTags(db.tags);
    store.setFiles(db.files);
};

export const TagsBlock: React.FC<{store: Store.Store; tags: Store.Tag[]}> = observer(({store, tags}) => {
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
                                                filtering: {tagsIds: [tag.id]}
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

export const MainView: React.FC<{store: Store.Store}> = observer(({store}) => {
    const [loaded, setLoaded] = React.useState(false);
    const {projectName} = useParams<{projectName: string}>();

    React.useEffect(() => {
        document.title = `media-tagger | ${projectName}`;

        (async () => {
            await loadProject(projectName, store);

            setLoaded(true);
        })();
    }, []);

    const taggedFiles = store.files.filter(f => f.tagsIds.length !== 0);
    const nonTaggedFiles = store.files.filter(f => f.tagsIds.length === 0);
    const filesWithDescription = store.files.filter(f => f.description);
    const tab = store.activeTab;

    return (
        <Wrapper>
            <Sidebar>
                <div>
                    <ul>
                        <li>all files: {store.files.length}</li>
                        <li>files w tags: {taggedFiles.length} </li>
                        <li>files with no tags: {nonTaggedFiles.length}</li>
                        <li>files w desc: {filesWithDescription.length}</li>
                    </ul>
                </div>

                <div>
                    all tags: {store.tags.length}
                </div>

                <TagsBlock store={store} tags={store.topLevelTags} />
            </Sidebar>

            <TopBar>
                <div>
                    <ul style={{display: 'flex', listStyle: 'none'}}>
                        {
                            // ['gallery', 'gallery', 'list']
                            store.tabs.map((tab, i) => {
                                return (
                                    <li key={i}>
                                        <button
                                            style={{fontWeight: store.activeTab === tab ? 'bold' : 'normal'}}
                                            onClick={() => {
                                                if (store.activeTab === tab) return;

                                                store.setActiveTab(tab);
                                            }}
                                        >tab #{i} ({tab.filtering.filePaths.length})</button>
                                    </li>
                                );
                            })

                        }
                    </ul>
                </div>

                <SettingsBlock>
                    <div>filtered files: {tab.filtering.filePaths.length} ({store.filePaths.length} total)</div>
                    <div style={{display: 'flex'}}>
                        <div>sort</div>
                        <button
                            style={{ fontWeight: tab.sorting.field === 'path' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('path', tab.sorting.asc);
                            }}
                        >path</button>
                        <button
                            style={{ fontWeight: tab.sorting.field === 'mtime' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('mtime', tab.sorting.asc);
                            }}
                        >mtime</button>
                        <button
                            style={{ fontWeight: tab.sorting.field === 'size' ? 'bold' : 'normal' }}
                            onClick={() => {
                                tab.sorting.setSorting('size', tab.sorting.asc);
                            }}
                        >size</button>
                        <button
                            onClick={() => {
                                tab.sorting.setSorting(tab.sorting.field, !tab.sorting.asc);
                            }}
                        >{tab.sorting.asc ? 'asc' : 'desc'}</button>
                    </div>
                    <div style={{display: 'flex'}}>
                        <button
                            disabled={tab.pagination.isFirstPage}
                            onClick={() => {
                                tab.pagination.goToPrevPage();
                            }}
                        >prev</button>
                        {/* <div>1 2 3 ... 8 (9) 10 ... 56 57 58</div> */}
                        <form style={{ display: 'flex' }}>
                            <div>go to page:</div>
                            <input
                                type="number"
                                value={tab.pagination.currentPage}
                                onChange={e => {
                                    tab.pagination.setCurrentPage(e.currentTarget.valueAsNumber);
                                }}
                            />
                        </form>
                        <div> / {tab.pagination.pagesCount}</div>
                        <button
                            disabled={tab.pagination.isLastPage}
                            onClick={() => {
                                tab.pagination.goToNextPage();
                            }}
                        >next</button>
                        <form style={{ display: 'flex' }}>
                            <div>per page</div>
                            <input
                                type="number"
                                value={tab.pagination.perPage}
                                onChange={e => {
                                    tab.pagination.setPerPage(e.currentTarget.valueAsNumber);
                                }}
                            />
                        </form>
                    </div>
                    <form style={{display: 'flex'}}>
                        <div>max height</div>
                        <input
                            type="number"
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
                            onChange={e => {
                                tab.config.setFileHeight(e.currentTarget.valueAsNumber);
                            }}
                        />
                    </form>
                </SettingsBlock>
            </TopBar>

            {
                loaded
                &&
                <MainContent>
                    <MediaList width={tab.config.fileWidth} height={tab.config.fileHeight}>
                        {
                            tab.pagination.filePaths.map(filePath => {
                                const url = store.api.getProjectFileUrl(projectName, filePath.path);

                                return (
                                    <li key={filePath.path}>
                                        <div style={{position: 'relative'}}>
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
                                                            <source src={url} type="video/mp4" />
                                                        </video>
                                                        :
                                                        filePath.fileType === 'image'
                                                            ?
                                                            <img
                                                                src={url}
                                                                alt={filePath.path}
                                                                // width={tab.config.fileWidth}
                                                                height={tab.config.fileHeight}
                                                                style={{display: 'block'}}
                                                                loading="lazy"
                                                            />
                                                            :
                                                            <div>
                                                                <div>{url}</div>
                                                                <div>unsupported file extension:  {filePath.fileExt}</div>
                                                            </div>
                                                }
                                            </div>

                                            <div style={{position: 'absolute', left: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14}}>
                                                <a href={url} title={filePath.path}>link</a>
                                            </div>

                                            <div style={{position: 'absolute', right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14}}>
                                                {filePath.sizeString}
                                            </div>

                                            {
                                                filePath.file
                                                &&
                                                <div style={{position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14}}>#{filePath.file.id}</div>
                                            }

                                            {
                                                filePath.file?.tags.length
                                                &&
                                                <div style={{position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(255, 255, 255, .75)', fontSize: 14}}>
                                                    <span title={`${filePath.file.tags.map(t => t.pathString).join('\n')}`}>{filePath.file.tags.length} tags</span>
                                                </div>
                                            }
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </MediaList>
                </MainContent>
            }
        </Wrapper>
    );
});