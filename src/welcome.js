import React from 'react';
import {Register} from './register';
import {SignIn} from './signin';

export function Welcome(props) {
    console.log(props.children);
    return (
        <div id="welcome-div">
            <h1 id="title">The Pen Pal Project
                <div id="subtitle">Connect with Other Pals From Around the World</div>
            </h1>
            {props.children}
        </div>
    )
}
