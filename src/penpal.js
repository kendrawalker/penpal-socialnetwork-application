import React from 'react';
import {ProfilePic} from './profilepic';
import {ProfilePicUpload} from './profilepicupload'

export class PenPal extends React.Component {
    constructor(props) {
        super(props);
        this.state= {};
        this.setImage = this.setImage.bind(this);
    }
    componentDidMount() {
        axios.get('/userprofile').then((res) => {
            this.setState({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                profilePicURL: res.data.profilePicURL
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
        console.log(this.state.profilePicURL, this.state.lastName);
        return (
            <div>
                <div id="logo">The Pen Pal Project</div>
                <ProfilePic firstName={this.state.firstName} profilePicURL={this.state.profilePicURL}
                    openProfilePicUpload={() => this.setState({showProfilePicUpload: true})} />
                {this.state.showProfilePicUpload && <ProfilePicUpload setImage={this.setImage} />}
            </div>
        );
    }
}
