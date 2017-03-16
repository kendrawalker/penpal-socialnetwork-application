import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';
import {Register} from './register';
import {Welcome} from './welcome';
import {PenPal} from './penpal';
import {SignIn} from './signin';
import {ProfilePicUpload} from './profilepicupload';

const router = (
    <Router history={hashHistory}>
        <Route path="/" component={Welcome}>
            <Route path="/signin" component={SignIn} />
            <IndexRoute component={Register} />
  	    </Route>
    </Router>
);

alert(location.pathname);

ReactDOM.render(
    location.pathname == '/welcome' ? router : <PenPal />,
    document.querySelector('main')
);
