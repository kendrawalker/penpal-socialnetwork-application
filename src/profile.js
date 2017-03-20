import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';
import {Bio} from './bio';
import {EditBio} from './editbio';
import {ProfilePic} from './profilepic';


export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state= {};
    }
    render() {
        const elem = <EditBio
            bio={this.props.bio}
            age={this.props.age}
            gender={this.props.gender}
            address1={this.props.address1}
            address2={this.props.address2}
            city={this.props.city}
            state={this.props.state}
            country={this.props.country}
            postalCode={this.props.postalCode}
            editBio={this.props.editBio}
            showBioEditor={this.props.showBioEditor} />
        return (
            <div id="profile">
                <div id="current-profile-bio">
                    <ProfilePic profilePicURL={this.props.profilePicURL} />
                    <div id="bio-text-holder">
                        <h3 className="full-name">{`${this.props.firstName} ${this.props.lastName}`}</h3>
                        <Bio
                            bio={this.props.bio}
                            age={this.props.age}
                            gender={this.props.gender}
                            address1={this.props.address1}
                            address2={this.props.address2}
                            city={this.props.city}
                            state={this.props.state}
                            country={this.props.country}
                            postalCode={this.props.postalCode}
                            openBioEditor={this.props.openBioEditor} />
                    </div>
                </div>
                <div>
                    {this.props.showBioEditor && elem}
                </div>
            </div>
        )
    }
}
