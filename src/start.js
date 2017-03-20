import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import {Register} from './register';
import {Welcome} from './welcome';
import {PenPal} from './penpal';
import {SignIn} from './signin';
import {ProfilePicUpload} from './profilepicupload';
import {Profile} from './profile';

let router;
if (location.pathname == '/welcome') {
    router = (
        <Router history={hashHistory}>
            <Route path="/" component={Welcome}>
                <Route path="/signin" component={SignIn} />
                <IndexRoute component={Register} />
            </Route>
        </Router>
    )
} else {
    router = (
        <Router history={browserHistory}>
            <Route path='/' component={PenPal}>
                <IndexRoute component={Profile} />
            </Route>
        </Router>
    )
}

alert(location.pathname);

ReactDOM.render(
    router,
    document.querySelector('main')
);
