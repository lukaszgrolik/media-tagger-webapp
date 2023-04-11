import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';

import * as Store from './store/store';
import { GlobalUtils } from './lib/global-utils';
import { MainView } from './main-view';
import { Adapters, JsonDB } from './lib/json-db/json-db';
import { JsonDbData } from './types';

declare var window: {
    __store: Store.Store;
    __globalUtils: GlobalUtils;
};

const localStorageAdapter = new Adapters.LocalStorage({
    name: 'ui_settings',
    localStorage: localStorage
});
const localStorageDb = new JsonDB<JsonDbData>({
    adapter: localStorageAdapter,
    hooks: {

    }
});

const store = new Store.Store({
    localStorageAdapter,
    localStorageDb,
});
window.__store = store;
window.__globalUtils = new GlobalUtils(store);

// const pages = [

// ];

const app = (
    <BrowserRouter>
        {/* <ul>
            <NavLink activeStyle={{ fontWeight: 'bold' }} exact to="/">Home</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/progressions">Progressions</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/sequences">Sequences</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/training">Training</NavLink>
        </ul> */}

        <Switch>
            <Route path="/projects/:projectName">
                <MainView store={store} />
            </Route>

            <Route path="/*">
                <p>Route not found</p>
            </Route>

            {/* {
                pages.map(page => {
                    return (
                        <Route key={page.path} path={page.path}>
                            <page.Component />
                        </Route>
                    )
                })
            } */}
        </Switch>
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));