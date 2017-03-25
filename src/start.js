import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, IndexRoute, hashHistory, browserHistory} from 'react-router';
import * as io from 'socket.io-client';
import {Register} from './register';
import {Welcome} from './welcome';
import {PenPal} from './penpal';
import {SignIn} from './signin';
import {ProfilePicUpload} from './profilepicupload';
import {Profile} from './profile';
import {OtherPals} from './otherpals';
import {MyPals} from './mypals';
import {OnlineNow} from './onlinenow';
import {SignOut} from './signout';

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
    const socket = io.connect();
    socket.on('connect', function() {
        axios.get('/present/' + socket.id);
    });
    router = (
        <Router history={browserHistory}>
            <Route path='/' component={PenPal}>
                <IndexRoute component={Profile} />
                <Route path="/user/:id/profile" component={OtherPals} />
                <Route path="/mypals/:friends/list" component={MyPals} />
                <Route path="/online/now" component={OnlineNow} />
                // <Route path="/signout" component={SignOut} />
            </Route>
        </Router>
    )
}

alert(location.pathname);

ReactDOM.render(
    router,
    document.querySelector('main')
);
