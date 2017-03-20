import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';

export class Register extends React.Component {   //state functions need a render
    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleClick(e) {
        console.log(this);
        console.log(this.state.lastName, this.state.firstName, this.state.email, this.state.password);
        axios({
            method: 'post',
            url: '/register',
            data: {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password
            }
        }).then(function(res) {
            console.log(res);
            if(res.data.success) {
                location.replace('/');
            }
        })
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    render() {
        return (
            <div id="submit-data">
                <div id="first">
                    <input type="text" class="text-input" id="text-input-first" name="firstName" onChange={this.handleChange} /><p>First Name</p>
                </div>
                <div id="last">
                    <input type="text" class="text-input" id="text-input-last" name="lastName" onChange={this.handleChange} /><p>Last Name</p>
                </div>
                <div id="email">
                    <input type="text" class="text-input" id="text-input-email" name="email" onChange={this.handleChange} /><p>Email Address</p>
                </div>
                <div id="password">
                    <input type="password" class="text-input" id="text-input-password" name="password" onChange={this.handleChange} /><p>Password</p>
                </div>
                <button onClick={(e) => this.handleClick(e)} type="submit" id="submit-button" >Submit</button>
                <h4>If you are already a member, please <Link to="signin">Sign In</Link></h4>
            </div>
        )
    }
}
