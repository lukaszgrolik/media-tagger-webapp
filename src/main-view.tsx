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
    grid-area: top-bar;
    padding: 2em;
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
                        return (
                            <li key={tag.id}>
                                <div><span title={`#${tag.id}`}>{tag.name}</span> ({tag.files.length} files)</div>

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
                <div>filtered files: {store.filtering.filePaths.length} ({store.filePaths.length} total)</div>

                <div style={{display: 'flex'}}>
                    <div>sort</div>
                    <button
                        onClick={() => {
                            store.sorting.setSorting(store.sorting.sorting === 'asc' ? 'desc' : 'asc');
                        }}
                    >{store.sorting.sorting === 'asc' ? 'asc' : 'desc'}</button>
                </div>

                <div style={{display: 'flex'}}>
                    <button
                        disabled={store.pagination.isFirstPage}
                        onClick={() => {
                            store.pagination.goToPrevPage();
                        }}
                    >prev</button>
                    {/* <div>1 2 3 ... 8 (9) 10 ... 56 57 58</div> */}
                    <div>{store.pagination.pagesCount}</div>
                    <button
                        disabled={store.pagination.isLastPage}
                        onClick={() => {
                            store.pagination.goToNextPage();
                        }}
                    >next</button>
                </div>

                <form style={{display: 'flex'}}>
                    <div>go to page:</div>
                    <input
                        type="number"
                        value={store.pagination.currentPage}
                        onChange={e => {
                            store.pagination.setCurrentPage(e.currentTarget.valueAsNumber);
                        }}
                    />
                </form>

                <form style={{display: 'flex'}}>
                    <div>per page</div>
                    <input
                        type="number"
                        value={store.pagination.perPage}
                        onChange={e => {
                            store.pagination.setPerPage(e.currentTarget.valueAsNumber);
                        }}
                    />
                </form>

                <form style={{display: 'flex'}}>
                    <div>max height</div>
                    <input
                        type="number"
                        value={store.config.fileHeight}
                        onChange={e => {
                            store.config.setFileHeight(e.currentTarget.valueAsNumber);
                        }}
                    />
                    <input
                        type="range"
                        min={100}
                        max={700}
                        step={25}
                        value={store.config.fileHeight}
                        onChange={e => {
                            store.config.setFileHeight(e.currentTarget.valueAsNumber);
                        }}
                    />
                </form>
            </TopBar>

            {
                loaded
                &&
                <MainContent>
                    <MediaList width={store.config.fileWidth} height={store.config.fileHeight}>
                        {
                            store.pagination.filePaths.map(file => {
                                const url = store.api.getProjectFileUrl(projectName, file.path);

                                return (
                                    <li key={file.path}>
                                        {
                                            file.fileType === 'video'
                                                ?
                                                <video
                                                    // width={store.config.fileWidth}
                                                    height={store.config.fileHeight}
                                                    controls
                                                    style={{ display: 'block', backgroundColor: 'black' }}
                                                >
                                                    <source src={url} type="video/mp4" />
                                                </video>
                                                :
                                                file.fileType === 'image'
                                                    ?
                                                    <img
                                                        src={url}
                                                        alt={file.path}
                                                        // width={store.config.fileWidth}
                                                        height={store.config.fileHeight}
                                                        style={{display: 'block'}}
                                                    />
                                                    :
                                                    <div>
                                                        <div>{url}</div>
                                                        <div>unsupported file extension:  {file.fileExt}</div>
                                                    </div>
                                        }
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