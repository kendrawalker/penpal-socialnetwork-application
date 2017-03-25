import React from 'react';
import axios from './axios';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';

export class MyPals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            who: this.props.params.friends
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        console.log(this.state.who, "component mounting in process");
        axios.get('/mypals/' + this.state.who).then((res) => {
            console.log(res.data.pals);
            this.setState({
                pals: res.data.pals
            });
        })
    }
    handleClick(e) {
        console.log(this);
        console.log(this.state.who, "triggering get request for different type of friends");
        axios({
            method: 'get',
            url: '/mypals/' + this.state.who,
        }).then((res) => {
            // console.log(res);
            if(res.data.pals) {
                console.log(res.data.pals);
                this.updatePals(res.data.pals);
            }
        })
    }
    handleChange(e) {
        console.log(e.target.value);
        this.setState({
            who: e.target.value,
        });
    }
    updatePals(paldata) {
        this.setState({
            pals: paldata
        });
    }
    render() {
        console.log(this.state.who, "rendering is occuring");
        let pals = this.state.pals;
        console.log(pals);
        if(!pals) {
            return null;
        }
        return (
            <div id="display-of-pals">
                <div id="friend-type">
                    <select id="friend-type-selector" onChange={this.handleChange} >
                        <option value="friends">My Pals</option>
                        <option value="nonFriends">Potential Pals</option>
                        <option value="pendingFriends">My Pending Pal Requests</option>
                    </select>
                    <button onClick={(e) => this.handleClick(e)} type="submit" id="submit-button" >Submit</button>
                </div>
                <div id="pal-cards">
                    {pals.map(function(pal) {
                        return (
                            <div className="card-container">
                                <Link className="card" to={`/user/${pal.id}/profile`}>
                                    <div className="pal-images-div">
                                        <img className="pal-images" src={pal.image || "/computer-user.png"} />
                                    </div>
                                    <div className="card-text">
                                        <h4 className="pal-name-title">{`${pal.first_name} ${pal.last_name}`}</h4>
                                        <p className="pal-city">{pal.city}</p>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}
