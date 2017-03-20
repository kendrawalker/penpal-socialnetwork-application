import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';


export function Bio(props) {
    return (
        <div id="bio-profile-div">
            <p>{props.bio}</p>
            <p>{props.gender} {props.age}</p>
            <p className="address">{props.address1}</p>
            <p className="address">{props.address2}</p>
            <p>{props.city} {props.state} {props.country} {props.postalCode}</p>
            <button id="bio-edit-button" onClick={props.openBioEditor}>Edit Bio</button>
        </div>
    )
}
