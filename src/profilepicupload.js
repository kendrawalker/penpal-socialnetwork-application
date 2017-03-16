import React from 'react';
import {axios} from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';

export class ProfilePicUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleClick(e) {
        console.log(this);
        var file = this.state.file;
        console.log(file);

        var formData = new FormData();
        formData.append('file', file);
        axios({
            method: 'post',
            url: '/fileupload',
            data: formData
        }).then((res) => {
            console.log(res);
            if(res.data.image) {
                console.log(res.data.image);
                this.props.setImage(res.data.image)
            }
        })
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.files[0],
        });
    }
    render() {
        return (
            <div id="upload-pic-form">
                <h3 id="upload-title">Change Your Profile Pic</h3>
                <div>Attention: Please do not add anything inappropriate as young people may be on this site.</div>
                <input type="file" name="file" id="file-input" onChange={this.handleChange}></input>
                <button onClick={(e) => this.handleClick(e)} type="submit" id="submit-button">Submit</button>
            </div>
        )
    }
}
