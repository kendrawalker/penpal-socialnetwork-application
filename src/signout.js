import React from 'react';
import axios from './axios';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';


export function SignOut() {
    axios.get('/signout/user').then((res) => {
        console.log("user is logged out");
        console.log(res);
        if(res.data.success) {
            location.replace('/');
        }
    });
}
