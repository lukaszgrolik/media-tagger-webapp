import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import * as fileParser from './lib/file-parser';
import * as Store from './store/store';
import { GlobalUtils } from './lib/global-utils';
import { MediaGrid } from './components/media-grid/media-grid';
import { Sidebar } from './components/sidebar/sidebar';
import { TopBar } from './components/top-bar';

declare var TAGS_FILE: string;
declare var window: {
    loadProject: (...args: any[]) => any;
    __globalUtils: GlobalUtils;
}

window.__globalUtils = new GlobalUtils();

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

    return (
        <Wrapper>
            <Sidebar store={store} />

            <TopBar store={store} />

            {
                loaded
                &&
                <MediaGrid store={store} projectName={projectName} />
            }
        </Wrapper>
    );
});