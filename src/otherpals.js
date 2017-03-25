import React from 'react';
import axios from './axios';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';
import {ProfilePic} from './profilepic';
import {FriendButton} from './friendbutton';

export class OtherPals extends React.Component {
    constructor(props) {
        super(props);
        this.state= {};
        this.changeFriendStatus = this.changeFriendStatus.bind(this);
    }
    componentDidMount() {
        axios.get('/user/'+ this.props.params.id).then((res) => {
            this.setState({
                id: res.data.id,
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                profilePicURL: res.data.profilePicURL,
                bio: res.data.bio,
                age: res.data.age,
                gender: res.data.gender,
                city: res.data.city,
                country: res.data.country,
                friendStatus: res.data.friendStatus,
                status: res.data.status,
                requestor: res.data.requestor,
                pal: this.props.params.id
            });
        })
    }
    changeFriendStatus() {
        console.log(this.state.status, "change friend status initiated");
        axios({
            method: 'post',
            url: '/updatefriendstatus',
            data: {
                status: this.state.status,
                requestor: this.state.requestor,
                pal: this.state.pal
            },
        }).then((res) => {
            console.log(res);
            if(res.data) {
                console.log(res.data.status, res.data.requestor, res.data.friendStatus);
                this.setState({
                    friendStatus: res.data.friendStatus,
                    status: res.data.status,
                    requestor: res.data.requestor
                });
            }
        })
    }
    render() {
        console.log(this.state.friendStatus);
        return (
            <div id="profile">
                <div id="current-profile-bio">
                    <ProfilePic profilePicURL={this.state.profilePicURL} />
                    <div id="bio-text-holder">
                        <h3 className="full-name">{`${this.state.firstName} ${this.state.lastName}`}</h3>
                        <div id="bio-profile-div">
                            <p>{this.state.bio}</p>
                            <p>{this.state.gender} {this.state.age}</p>
                            <p>{this.state.city} {this.state.country}</p>
                        </div>
                    </div>
                </div>
                <FriendButton friendStatus={this.state.friendStatus} changeFriendStatus={this.changeFriendStatus} />
            </div>
        )
    }
}
