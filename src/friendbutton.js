import React from 'react';
import axios from './axios';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';


export function FriendButton(props) {
    console.log(props.friendStatus, "friendbutton component");
    return (
        <div id="friend-button-div">
            <button id="friend-button" onClick={props.changeFriendStatus}>{props.friendStatus}</button>
        </div>
    )
}
