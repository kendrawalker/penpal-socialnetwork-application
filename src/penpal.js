import React from 'react';
import {ProfilePic} from './profilepic';
import {ProfilePicUpload} from './profilepicupload';
import {Profile} from './profile';
import {Bio} from './bio';
import {EditBio} from './editbio';
import {OtherPals} from './otherpals';
import {MyPals} from './mypals';
import {SignOut} from './signout';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';

export class PenPal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.setImage = this.setImage.bind(this);
    }
    componentDidMount() {
        axios.get('/userprofile').then((res) => {
            this.setState({
                id: res.data.id,
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                profilePicURL: res.data.profilePicURL,
                bio: res.data.bio,
                age: res.data.age,
                gender: res.data.gender,
                address1: res.data.address1,
                address2: res.data.address2,
                city: res.data.city,
                state: res.data.state,
                country: res.data.country,
                postalCode: res.data.postalCode
            });
        })
    }
    setImage(val) {
        this.setState({
            profilePicURL: val,
            showProfilePicUpload: false
        });
    }
    render() {
        const openProfilePicUpload = () => this.setState({showProfilePicUpload: true})
        const children = this.props.children && React.cloneElement(this.props.children, {
            id: this.state.id,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            profilePicURL: this.state.profilePicURL,
            bio: this.state.bio,
            editBio: (data) => {
                this.setState({
                    showBioEditor: false,
                    bio: data.bio,
                    age: data.age,
                    gender: data.gender,
                    address1: data.address1,
                    address2: data.address2,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    postalCode: data.postalCode,
                });
            },
            openBioEditor: () => {
                this.setState({showBioEditor: true});
            },
            age: this.state.age,
            gender: this.state.gender,
            address1: this.state.address1,
            address2: this.state.address2,
            city: this.state.city,
            state: this.state.state,
            country: this.state.country,
            postalCode: this.state.postalCode,
            openProfilePicUpload,
            showBioEditor: this.state.showBioEditor
        });
        return (
            <div id="penpal">
                <div id="logo">
                    <div id="logo-text">The Pen Pal Project</div>
                    <div id="penpal-icons">
                        <Link id="network-man" to="/mypals/friends/list"><img src="/networkman.png" /></Link>
                        <Link id="home" to="#"><img id="home-pic" src="/homeicon.png" /></Link>
                        <Link id="signout" to="/signout"><img id="exit-pic" src="/x.png" /></Link>
                        <div id="icon-pic-holder"><ProfilePic firstName={this.state.firstName} profilePicURL={this.state.profilePicURL} openProfilePicUpload={openProfilePicUpload} /></div>
                    </div>
                    <div id="online-link-div"><Link id="online-pals-link" to="/online/now">View Pals Online Now</Link></div>
                </div>
                {this.state.showProfilePicUpload && <ProfilePicUpload setImage={this.setImage} profilePicURL={this.state.profilePicURL} />}

                {children}
            </div>
        );
    }
}
