import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';


export function ProfilePic(props) {
    console.log(props.profilePicURL, 777);
    return (
        <div id="icon-pic-div" onClick={props.openProfilePicUpload} >
            <img id="profile-pic-icon" src={props.profilePicURL} />
        </div>
    )
}
