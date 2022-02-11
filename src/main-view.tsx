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

    // const t0 = performance.now();
    store.setFilePaths(files);
    // const t1 = performance.now();
    // console.log(`setFilePaths`, t1 - t0);
};
const fetchDB = async (projectName: string, store: Store.Store) => {
    // const parsedFileData = fileParser.parseFile(TAGS_FILE);
    // console.log('parsedFileData', parsedFileData)

    // store.setTags(parsedFileData.tags);
    // store.setFiles(parsedFileData.files);

    const db = await store.api.fetchDB(projectName);

    // const t0 = performance.now();
    store.setTags(db.tags);
    store.setFiles(db.files);
    // const t1 = performance.now();
    // console.log(`setTags + setFiles`, t1 - t0);

};

async function loadLocalStorageData(store: Store.Store) {
    store.opts.localStorageAdapter.createIfDoesNotExist(['projects', 'tabs']);

    const data = await store.opts.localStorageDb.read();

    if (data.tabs.length) {
        store.setTabs(data.tabs);
    }
    else {
        await store.createEmptyTab();
    }

    if (!data.projects.length) {
        await store.opts.localStorageDb.insert('projects', {});
    }
    else {
        if (data.projects[0].activeTabId) {
            store.setActiveTabId(data.projects[0].activeTabId);
        }
        else {
            store.setActiveTabId(store.tabs[0].id);
        }
    }
}

export const MainView: React.FC<{store: Store.Store}> = observer(({store}) => {
    const [loaded, setLoaded] = React.useState(false);
    const {projectName} = useParams<{projectName: string}>();

    React.useEffect(() => {
        document.title = `media-tagger | ${projectName}`;

        window.__globalUtils.activeProjectName = projectName;

        (async () => {
            // const t0 = performance.now();
            await loadProject(projectName, store);
            // const t1 = performance.now();
            // console.log('loadProject', t1 - t0);

            setLoaded(true);

            loadLocalStorageData(store);
        })();
    }, []);

    return (
        <Wrapper>
            <Sidebar store={store} projectName={projectName} />

            <TopBar store={store} />

            {
                loaded
                &&
                <MediaGrid store={store} projectName={projectName} />
            }
        </Wrapper>
    );
});