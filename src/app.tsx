import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';

import * as Store from './store/store';
import { MainView } from './main-view';

declare var window: {__store: Store.Store};

const store = new Store.Store();
window.__store = store;

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