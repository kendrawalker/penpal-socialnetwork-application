import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';

export class SignIn extends React.Component {   //state functions need a render
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
        console.log(this.state.email, this.state.password);
        axios({
            method: 'post',
            url: '/signin',
            data: {
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
        console.log(e.target.name);
        console.log(e.target.value);
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    render() {
        return (
            <div id="submit-data">
                <div id="email">
                    <input type="text" class="text-input" id="text-input-email" name="email" onChange={this.handleChange} /><p>Email Address</p>
                </div>
                <div id="password">
                    <input type="password" class="text-input" id="text-input-password" name="password" onChange={this.handleChange} /><p>Password</p>
                </div>
                <button onClick={(e) => this.handleClick(e)} type="submit" id="submit-button" >Submit</button>
                <h4>Return back to <Link to="#">Register</Link></h4>
            </div>
        )
    }
}
