import React from 'react';
import axios from './axios';
import { Router, Route, Link, IndexRoute, hashHistory } from 'react-router';


export class EditBio extends React.Component {
    constructor(props) {
        super(props);
        var {bio, age, gender, address1, address2, city, state, country, postalCode, showBioEditor} = this.props;
        this.state = {bio, age, gender, address1, address2, city, state, country, postalCode, showBioEditor};
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleClick(e) {
        var data = {
            bio: this.state.bio,
            age: this.state.age,
            gender: this.state.gender,
            address1: this.state.address1,
            address2: this.state.address2,
            city: this.state.city,
            state: this.state.state,
            country: this.state.country,
            postalCode: this.state.postalCode
        };
        axios({
            method: 'post',
            url: '/updatebio',
            data: data,
        }).then((res) => {
            if(res.data.success) {
                this.props.editBio(data);
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
            <div id="bio-edit-div">
                <div id="bio-div">
                    <textarea type="text" className="text-input" id="text-input-bio" name="bio" value={this.state.bio} onChange={this.handleChange}></textarea><p>Bio</p>
                </div>
                <div id="age-div">
                    <input type="text" className="text-input" id="text-input-age" name="age" value={this.state.age} onChange={this.handleChange} /><p>Age</p>
                </div>
                <div id="gender-div">
                    <input type="text" className="text-input" id="text-input-gender" name="gender" value={this.state.gender} onChange={this.handleChange} /><p>Gender</p>
                </div>
                <div id="address1-div">
                    <input type="text" className="text-input" id="text-input-address1" name="address1" value={this.state.address1} onChange={this.handleChange} /><p>Address1</p>
                </div>
                <div id="address2-div">
                    <input type="text" className="text-input" id="text-input-address2" name="address2" value={this.state.address2} onChange={this.handleChange} /><p>Address2</p>
                </div>
                <div id="city-div">
                    <input type="text" className="text-input" id="text-input-city" name="city" value={this.state.city} onChange={this.handleChange} /><p>City</p>
                </div>
                <div id="state-div">
                    <input type="text" className="text-input" id="text-input-state" name="state" value={this.state.state} onChange={this.handleChange} /><p>State</p>
                </div>
                <div id="country-div">
                    <input type="text" className="text-input" id="text-input-country" name="country" value={this.state.country} onChange={this.handleChange} /><p>Country</p>
                </div>
                <div id="postalcode-div">
                    <input type="text" className="text-input" id="text-input-postalcode" name="postalCode" value={this.state.postalCode} onChange={this.handleChange} /><p>Postal Code</p>
                </div>
                <button onClick={(e) => this.handleClick(e)} type="submit" id="submit-button" >Submit</button>
            </div>
        )
    }
}
